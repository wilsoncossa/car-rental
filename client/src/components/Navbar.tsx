import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, LayoutDashboard, Settings, Car, Users } from "lucide-react";

export function Navbar() {
  const { user, logout, isAuthenticated, isActive, role } = useAuth();
  const [location] = useLocation();

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'funcionario') return '/funcionario';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (role === 'admin') return 'Painel Admin';
    if (role === 'funcionario') return 'Painel Funcionário';
    return 'Meu Painel';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold tracking-tight">BookCars <span className="text-primary">MZ</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/cars" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/cars' ? 'text-primary' : 'text-muted-foreground'}`} data-testid="link-cars">
            Viaturas
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {user?.firstName?.[0] || <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && (
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    )}
                    <p className="text-xs text-primary capitalize">{role || 'cliente'}</p>
                  </div>
                </div>
                {isActive && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={getDashboardLink()}>
                      <div className="flex items-center w-full" data-testid="link-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{getDashboardLabel()}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logout()}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <a href="/login" data-testid="link-login">Entrar</a>
              </Button>
              <Button asChild className="shadow-lg shadow-primary/20">
                <a href="/register" data-testid="link-register">Registar</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
