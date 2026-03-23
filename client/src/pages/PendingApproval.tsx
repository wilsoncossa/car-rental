import { Navbar } from "@/components/Navbar";
import { Clock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PendingApproval() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Conta Pendente</h1>
          <p className="text-muted-foreground mb-4">
            Olá{user?.firstName ? `, ${user.firstName}` : ''}! A sua conta foi registada com sucesso mas ainda está pendente de aprovação pelo administrador.
          </p>
          <div className="bg-white border rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user?.email || 'Email não disponível'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-amber-600 font-medium">Estado: Pendente</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Será notificado quando a sua conta for ativada. Pode continuar a navegar pelas viaturas disponíveis.
          </p>
        </div>
      </div>
    </div>
  );
}
