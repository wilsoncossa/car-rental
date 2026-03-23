import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Acesso Negado</h1>
        <p className="text-muted-foreground mb-8">
          Não tem permissão para aceder a esta página. Contacte o administrador se acredita que isto é um erro.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Voltar ao Início</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Meu Painel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
