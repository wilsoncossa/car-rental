import type { Express, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "./storage";

// JWT Secret (em produção deve vir de variável de ambiente)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = "7d";

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  firstName: z.string().min(1, "Nome obrigatório"),
  lastName: z.string().min(1, "Sobrenome obrigatório"),
  contacto: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

// Gerar token JWT
function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Verificar token JWT
export function verifyToken(
  token: string,
): { userId: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

// Middleware de autenticação
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    // Adicionar usuário ao request
    (req as any).user = {
      claims: { sub: decoded.userId },
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Erro na autenticação" });
  }
};

// Registrar rotas de autenticação
export function registerAuthRoutes(app: Express): void {
  async function handleRegister(req: any, res: any) {
    try {
      const input = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const user = await storage.createUser({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        contacto: input.contacto,
        role: "cliente",
        status: "pending",
      });

      const token = generateToken(user.id, user.email!, user.role!);

      res.status(201).json({
        message: "Usuário registrado com sucesso",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }
      console.error("Erro no registro:", error);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  }

  async function handleLogin(req: any, res: any) {
    try {
      const input = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(input.email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        user.passwordHash!,
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      const token = generateToken(user.id, user.email!, user.role!);

      res.json({
        message: "Login realizado com sucesso",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          profileCompleted: user.profileCompleted,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }
      console.error("Erro no login:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  }

  // POST /api/auth/register
  app.post("/api/auth/register", handleRegister);
  app.post("/api/register", handleRegister);

  // GET redirect for browser navigation
  app.get("/api/auth/register", (_req, res) => res.redirect("/register"));
  app.get("/api/register", (_req, res) => res.redirect("/register"));

  // POST /api/auth/login
  app.post("/api/auth/login", handleLogin);
  app.post("/api/login", handleLogin);

  // GET redirect for browser navigation
  app.get("/api/auth/login", (_req, res) => res.redirect("/login"));
  app.get("/api/login", (_req, res) => res.redirect("/login"));

  // POST /api/auth/logout
  app.post("/api/auth/logout", (_req, res) => {
    // Com JWT, o logout é feito no cliente (removendo o token)
    // Redirect no browser para a home.
    res.redirect("/");
  });

  // GET /api/auth/logout
  app.get("/api/auth/logout", (_req, res) => {
    res.redirect("/");
  });

  // POST /api/logout
  app.post("/api/logout", (_req, res) => {
    res.redirect("/");
  });

  // GET /api/logout
  app.get("/api/logout", (_req, res) => {
    res.redirect("/");
  });

  // GET /api/auth/me
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        profileCompleted: user.profileCompleted,
        profileImageUrl: user.profileImageUrl,
        contacto: user.contacto,
        documento: user.documento,
        dataNascimento: user.dataNascimento,
        nacionalidade: user.nacionalidade,
        nuit: user.nuit,
        cartaNumero: user.cartaNumero,
        cartaEmissao: user.cartaEmissao,
        cartaValidade: user.cartaValidade,
        cartaPaisEmissor: user.cartaPaisEmissor,
        cartaFotoUrl: user.cartaFotoUrl,
        enderecoCidade: user.enderecoCidade,
        enderecoBairro: user.enderecoBairro,
        enderecoNumeroCasa: user.enderecoNumeroCasa,
        enderecoPais: user.enderecoPais,
        aceitouTermos: user.aceitouTermos,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Erro ao buscar dados do usuário" });
    }
  });
}
