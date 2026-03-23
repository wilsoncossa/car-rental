import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Car, FileText, AlertTriangle, 
  Settings, BarChart3, UserCircle, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminMenu = [
  { href: "/admin", label: "Visão Geral", icon: BarChart3 },
  { href: "/admin/utilizadores", label: "Utilizadores", icon: Users },
  { href: "/admin/reservas", label: "Reservas", icon: FileText },
  { href: "/admin/viaturas", label: "Viaturas", icon: Car },
  { href: "/admin/multas", label: "Multas", icon: AlertTriangle },
];

const funcionarioMenu = [
  { href: "/funcionario", label: "Painel", icon: LayoutDashboard },
  { href: "/funcionario/clientes", label: "Clientes", icon: Users },
  { href: "/funcionario/reservas", label: "Reservas", icon: FileText },
  { href: "/funcionario/multas", label: "Multas", icon: AlertTriangle },
];

const clienteMenu = [
  { href: "/dashboard", label: "Meu Painel", icon: LayoutDashboard },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: UserCircle },
  { href: "/dashboard/reservas", label: "Minhas Reservas", icon: FileText },
  { href: "/dashboard/multas", label: "Minhas Multas", icon: AlertTriangle },
];

export function Sidebar() {
  const { user, role, logout } = useAuth();
  const [location] = useLocation();

  const menu = role === 'admin' ? adminMenu : role === 'funcionario' ? funcionarioMenu : clienteMenu;
  const roleLabel = role === 'admin' ? 'Administrador' : role === 'funcionario' ? 'Funcionário' : 'Cliente';

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b">
        <Link href="/">
          <span className="font-display text-xl font-bold tracking-tight cursor-pointer">
            BookCars <span className="text-primary">MZ</span>
          </span>
        </Link>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const isActive = location === item.href || (item.href !== '/admin' && item.href !== '/funcionario' && item.href !== '/dashboard' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
