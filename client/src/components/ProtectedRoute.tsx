import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  requireActive?: boolean;
}

export function ProtectedRoute({ children, roles, requireActive = true }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isActive, profileCompleted, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!profileCompleted) {
    return <Redirect to="/completar-perfil" />;
  }

  if (requireActive && !isActive) {
    return <Redirect to="/pendente" />;
  }

  if (roles && roles.length > 0 && !roles.includes(role || '')) {
    return <Redirect to="/acesso-negado" />;
  }

  return <>{children}</>;
}
