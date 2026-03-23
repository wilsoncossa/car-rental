import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { FileText, AlertTriangle, Car } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data: bookings } = useQuery({ queryKey: ['/api/bookings'] });
  const { data: fines } = useQuery({ queryKey: ['/api/fines'] });

  const bookingsList = (bookings as any[]) || [];
  const finesList = (fines as any[]) || [];
  const pendingFines = finesList.filter((f: any) => f.status === 'pending');

  return (
    <DashboardLayout title="Meu Painel" subtitle={`Bem-vindo, ${user?.firstName || 'Cliente'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card data-testid="card-my-bookings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Reservas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsList.length}</div>
            <p className="text-xs text-muted-foreground">Total de reservas</p>
          </CardContent>
        </Card>
        <Card data-testid="card-active-bookings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Ativas</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsList.filter((b: any) => b.bookingStatus === 'confirmed').length}</div>
            <p className="text-xs text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card data-testid="card-pending-fines">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multas Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFines.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingFines.reduce((s: number, f: any) => s + Number(f.amount), 0).toLocaleString()} MZN
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button asChild><Link href="/cars">Ver Viaturas</Link></Button>
        <Button variant="outline" asChild><Link href="/dashboard/reservas">Ver Reservas</Link></Button>
      </div>
    </DashboardLayout>
  );
}
