import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, FileText, AlertTriangle } from "lucide-react";

export default function FuncionarioPanel() {
  const { data: clients } = useQuery({ queryKey: ['/api/users/clients'] });
  const { data: bookings } = useQuery({ queryKey: ['/api/bookings'] });
  const { data: allFines } = useQuery({ queryKey: ['/api/fines'] });

  const clientsList = (clients as any[]) || [];
  const bookingsList = (bookings as any[]) || [];
  const finesList = (allFines as any[]) || [];

  return (
    <DashboardLayout title="Painel do Funcionário" subtitle="Gestão de clientes e reservas">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-clients-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsList.length}</div>
          </CardContent>
        </Card>
        <Card data-testid="card-bookings-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsList.length}</div>
          </CardContent>
        </Card>
        <Card data-testid="card-fines-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multas Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finesList.filter((f: any) => f.status === 'pending').length}</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
