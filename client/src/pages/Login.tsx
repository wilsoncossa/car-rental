import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, ShieldCheck, Zap, Globe } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Erro ao fazer login");
        return;
      }

      localStorage.setItem("authToken", data.token);
      setLocation("/");
    } catch (err) {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Bem-vindo ao UMBRELLA CORPORATION SU LDA
          </CardTitle>
          <CardDescription>
            Aceda à sua conta para gerir as suas reservas e explorar a nossa frota.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta? <Link href="/register" className="underline">Registar</Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-2 text-muted-foreground">
                Porquê escolher-nos?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium">Pagamento Seguro</p>
                <p className="text-muted-foreground">Integração com M-Pesa, E-Mola e cartões.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-500 shrink-0" />
              <div>
                <p className="font-medium">Reserva Instantânea</p>
                <p className="text-muted-foreground">Confirmação em tempo real para qualquer viatura.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="font-medium">Alcance Nacional</p>
                <p className="text-muted-foreground">Disponível em Maputo, Beira e Nampula.</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
