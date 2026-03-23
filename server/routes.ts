import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerAuthRoutes, isAuthenticated } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Formato de imagem não suportado. Use JPG, PNG, WebP ou GIF.",
        ),
      );
    }
  },
});

function requireRole(...roles: string[]): RequestHandler {
  return async (req, res, next) => {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) return res.status(401).json({ message: "Não autenticado" });

    const user = await storage.getUser(userId);
    if (!user)
      return res.status(401).json({ message: "Utilizador não encontrado" });
    if (user.status !== "active")
      return res.status(403).json({ message: "Conta pendente de aprovação" });
    if (!roles.includes(user.role || ""))
      return res.status(403).json({ message: "Acesso negado" });

    (req as any).dbUser = user;
    next();
  };
}

function requireActive(): RequestHandler {
  return async (req, res, next) => {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) return res.status(401).json({ message: "Não autenticado" });

    const user = await storage.getUser(userId);
    if (!user)
      return res.status(401).json({ message: "Utilizador não encontrado" });
    if (user.status !== "active")
      return res.status(403).json({ message: "Conta pendente de aprovação" });

    (req as any).dbUser = user;
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  registerAuthRoutes(app);

  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/upload", isAuthenticated, (req, res) => {
    upload.single("image")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ message: "Imagem muito grande. Tamanho máximo: 2MB." });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada." });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    });
  });

  app.get(api.cars.list.path, async (req, res) => {
    try {
      const filters = {
        city: req.query.city as string | undefined,
        type: req.query.type as string | undefined,
        available:
          req.query.available === "true"
            ? true
            : req.query.available === "false"
              ? false
              : undefined,
      };
      const cars = await storage.getCars(filters);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/availability-dates", async (_req, res) => {
    try {
      const dates = await storage.getActiveBookingEndDates();
      res.json(dates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability dates" });
    }
  });

  app.get(api.cars.get.path, async (req, res) => {
    const car = await storage.getCar(Number(req.params.id));
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  });

  app.post(
    api.cars.create.path,
    isAuthenticated,
    requireRole("admin"),
    async (req, res) => {
      try {
        const input = api.cars.create.input.parse(req.body);
        const car = await storage.createCar(input);
        res.status(201).json(car);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join("."),
          });
        }
        throw err;
      }
    },
  );

  app.patch(
    api.cars.update.path,
    isAuthenticated,
    requireRole("admin"),
    async (req, res) => {
      try {
        const input = api.cars.update.input.parse(req.body);
        const car = await storage.updateCar(Number(req.params.id), input);
        res.json(car);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join("."),
          });
        }
        res.status(404).json({ message: "Car not found" });
      }
    },
  );

  app.delete(
    api.cars.delete.path,
    isAuthenticated,
    requireRole("admin"),
    async (req, res) => {
      try {
        await storage.deleteCar(Number(req.params.id));
        res.status(204).send();
      } catch (error) {
        res.status(404).json({ message: "Car not found" });
      }
    },
  );

  app.get(api.bookings.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);

    if (user?.role === "admin" || user?.role === "funcionario") {
      const allBookings = await storage.getAllBookings();
      return res.json(allBookings);
    }

    const userBookings = await storage.getBookings(userId);
    res.json(userBookings);
  });

  app.get(api.bookings.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);
    const booking = await storage.getBooking(Number(req.params.id));
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.userId !== userId &&
      user?.role !== "admin" &&
      user?.role !== "funcionario"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    res.json(booking);
  });

  app.post(
    api.bookings.create.path,
    isAuthenticated,
    requireActive(),
    async (req, res) => {
      try {
        const input = api.bookings.create.input.parse(req.body);
        const car = await storage.getCar(input.carId);
        if (!car) throw new Error("Car not found");

        const days = Math.ceil(
          (new Date(input.endDate).getTime() -
            new Date(input.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const totalPrice =
          Number(car.dailyRate) * days +
          Number(car.pricePerKm) * input.estimatedKm;

        const bookingData = {
          ...input,
          userId: (req.user as any).claims.sub,
          totalPrice: totalPrice.toString(),
          paymentStatus: "pending",
          bookingStatus: "pending",
        };

        const booking = await storage.createBooking(bookingData);
        res.status(201).json(booking);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join("."),
          });
        }
        res.status(400).json({ message: (err as Error).message });
      }
    },
  );

  app.patch(
    api.bookings.updateStatus.path,
    isAuthenticated,
    requireRole("admin", "funcionario"),
    async (req, res) => {
      try {
        const { bookingStatus } = req.body;
        const booking = await storage.updateBookingStatus(
          Number(req.params.id),
          bookingStatus,
        );
        res.json(booking);
      } catch (error) {
        res.status(404).json({ message: "Booking not found" });
      }
    },
  );

  app.get(
    api.users.list.path,
    isAuthenticated,
    requireRole("admin"),
    async (_req, res) => {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    },
  );

  app.get(
    "/api/users/clients",
    isAuthenticated,
    requireRole("admin", "funcionario"),
    async (_req, res) => {
      const clients = await storage.getClientUsers();
      res.json(clients);
    },
  );

  app.get(api.users.get.path, isAuthenticated, async (req, res) => {
    const requesterId = (req.user as any).claims.sub;
    const requester = await storage.getUser(requesterId);

    if (
      req.params.id !== requesterId &&
      requester?.role !== "admin" &&
      requester?.role !== "funcionario"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.patch(
    api.users.update.path,
    isAuthenticated,
    requireRole("admin", "funcionario"),
    async (req, res) => {
      try {
        const input = api.users.update.input.parse(req.body);
        const dbUser = (req as any).dbUser;

        if (dbUser.role === "funcionario") {
          const targetUser = await storage.getUser(req.params.id);
          if (!targetUser || targetUser.role !== "cliente") {
            return res
              .status(403)
              .json({ message: "Funcionários só podem editar clientes" });
          }
          const { role, status, ...allowedFields } = input;
          const user = await storage.updateUser(req.params.id, allowedFields);
          return res.json(user);
        }

        const user = await storage.updateUser(req.params.id, input);
        res.json(user);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(404).json({ message: "User not found" });
      }
    },
  );

  app.delete(
    api.users.delete.path,
    isAuthenticated,
    requireRole("admin"),
    async (req, res) => {
      try {
        await storage.deleteUser(req.params.id);
        res.status(204).send();
      } catch (error) {
        res.status(404).json({ message: "User not found" });
      }
    },
  );

  app.patch(api.users.updateProfile.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.users.updateProfile.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      if (input.profileCompleted === "true") {
        const requiredFields = [
          "firstName",
          "lastName",
          "dataNascimento",
          "nacionalidade",
          "documento",
          "contacto",
          "cartaNumero",
          "cartaEmissao",
          "cartaValidade",
          "cartaPaisEmissor",
          "cartaFotoUrl",
          "enderecoCidade",
          "enderecoBairro",
          "enderecoNumeroCasa",
          "enderecoPais",
        ] as const;

        const missing = requiredFields.filter(
          (f) =>
            !input[f as keyof typeof input] ||
            (input[f as keyof typeof input] as string).trim() === "",
        );

        if (missing.length > 0) {
          return res.status(400).json({
            message: "Preencha todos os campos obrigatórios antes de submeter.",
          });
        }

        if (input.aceitouTermos !== "true") {
          return res
            .status(400)
            .json({ message: "Deve aceitar os termos e condições." });
        }
      }

      const user = await storage.updateUser(userId, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid profile data" });
      }
      console.error("Failed to update profile:", err);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  app.get(api.fines.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);

    if (user?.role === "admin" || user?.role === "funcionario") {
      const allFines = await storage.getFines();
      return res.json(allFines);
    }

    const userFines = await storage.getFines(userId);
    res.json(userFines);
  });

  app.get(
    api.fines.userFines.path,
    isAuthenticated,
    requireRole("admin", "funcionario"),
    async (req, res) => {
      const userFines = await storage.getFines(req.params.userId);
      res.json(userFines);
    },
  );

  app.post(
    api.fines.create.path,
    isAuthenticated,
    requireRole("admin", "funcionario"),
    async (req, res) => {
      try {
        const input = api.fines.create.input.parse(req.body);
        const fine = await storage.createFine(input);
        res.status(201).json(fine);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(400).json({ message: "Failed to create fine" });
      }
    },
  );

  app.get(
    api.stats.get.path,
    isAuthenticated,
    requireRole("admin"),
    async (_req, res) => {
      const stats = await storage.getStats();
      res.json(stats);
    },
  );

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCars = await storage.getCars();
  if (existingCars.length === 0) {
    console.log("Seeding database with cars...");
    const carsData = [
      {
        make: "Toyota",
        model: "Fortuner",
        year: 2023,
        licensePlate: "MMT-123-MC",
        type: "SUV",
        dailyRate: 5000,
        pricePerKm: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1625231334401-ff979da08ef7?w=800&h=500&fit=crop",
        city: "Maputo",
        description: "Perfeito para viagens familiares e aventuras off-road.",
        features: ["AC", "Bluetooth", "4x4", "7 Lugares"],
        isAvailable: true,
      },
      {
        make: "Toyota",
        model: "Corolla",
        year: 2021,
        licensePlate: "ABG-456-MP",
        type: "Sedan",
        dailyRate: 3000,
        pricePerKm: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&h=500&fit=crop",
        city: "Beira",
        description: "Económico e confortável para condução urbana.",
        features: ["AC", "Bluetooth", "Automático"],
        isAvailable: true,
      },
      {
        make: "Ford",
        model: "Ranger",
        year: 2022,
        licensePlate: "ADF-789-NP",
        type: "Pickup",
        dailyRate: 6000,
        pricePerKm: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop",
        city: "Nampula",
        description: "Pickup robusta para cargas pesadas e terreno difícil.",
        features: ["AC", "4x4", "Barra de Reboque"],
        isAvailable: true,
      },
      {
        make: "Hyundai",
        model: "Tucson",
        year: 2023,
        licensePlate: "MTX-321-MP",
        type: "SUV",
        dailyRate: 4500,
        pricePerKm: 18,
        imageUrl:
          "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop",
        city: "Maputo",
        description: "SUV moderno com tecnologia de ponta e conforto superior.",
        features: ["AC", "Bluetooth", "Câmera Traseira", "Sensores"],
        isAvailable: true,
      },
      {
        make: "Nissan",
        model: "NP300",
        year: 2022,
        licensePlate: "BRA-654-BR",
        type: "Pickup",
        dailyRate: 5500,
        pricePerKm: 22,
        imageUrl:
          "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=500&fit=crop",
        city: "Beira",
        description: "Pickup versátil ideal para trabalho e lazer.",
        features: ["AC", "4x4", "Cabine Dupla"],
        isAvailable: true,
      },
      {
        make: "Toyota",
        model: "Hilux",
        year: 2023,
        licensePlate: "NPL-987-NP",
        type: "Pickup",
        dailyRate: 6500,
        pricePerKm: 24,
        imageUrl:
          "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&h=500&fit=crop",
        city: "Nampula",
        description:
          "A lendária Hilux — resistência comprovada em todo o terreno.",
        features: ["AC", "4x4", "Bluetooth", "Cabine Dupla"],
        isAvailable: true,
      },
      {
        make: "Suzuki",
        model: "Swift",
        year: 2021,
        licensePlate: "MPT-111-MC",
        type: "Económico",
        dailyRate: 2000,
        pricePerKm: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=500&fit=crop",
        city: "Maputo",
        description: "Compacto e económico, perfeito para a cidade.",
        features: ["AC", "Bluetooth", "Consumo Baixo"],
        isAvailable: true,
      },
      {
        make: "Honda",
        model: "Civic",
        year: 2022,
        licensePlate: "BRA-222-BR",
        type: "Sedan",
        dailyRate: 3500,
        pricePerKm: 16,
        imageUrl:
          "https://images.unsplash.com/photo-1606611013016-969c19ba27d5?w=800&h=500&fit=crop",
        city: "Beira",
        description: "Sedan desportivo com excelente performance e conforto.",
        features: ["AC", "Bluetooth", "Automático", "Ecrã Táctil"],
        isAvailable: true,
      },
      {
        make: "Mitsubishi",
        model: "Pajero",
        year: 2023,
        licensePlate: "NPL-333-NP",
        type: "SUV",
        dailyRate: 7000,
        pricePerKm: 28,
        imageUrl:
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop",
        city: "Nampula",
        description: "SUV premium para longas viagens com máximo conforto.",
        features: ["AC", "4x4", "Bluetooth", "7 Lugares", "Câmera 360°"],
        isAvailable: true,
      },
    ];

    for (const car of carsData) {
      await storage.createCar(car);
    }
    console.log(`Seeded ${carsData.length} cars.`);
  }
}
