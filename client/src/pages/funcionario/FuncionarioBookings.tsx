import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function FuncionarioBookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({ queryKey: ['/api/bookings'] });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/bookings/${id}/status`, { bookingStatus: status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: "Reserva atualizada" });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Reservas">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const allBookings = (bookings as any[]) || [];
  const statusLabel = (s: string) => {
    const map: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Concluída' };
    return map[s] || s;
  };

  return (
    <DashboardLayout title="Reservas" subtitle="Gerir reservas de clientes">
      <Card>
        <CardHeader><CardTitle>Reservas ({allBookings.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allBookings.map((booking: any) => (
              <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 last:border-0" data-testid={`card-booking-${booking.id}`}>
                <div className="space-y-1">
                  <p className="font-medium">{booking.car?.make} {booking.car?.model}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.startDate), "dd/MM/yyyy")} — {format(new Date(booking.endDate), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold">{Number(booking.totalPrice).toLocaleString()} MZN</div>
                  <Badge variant={booking.bookingStatus === 'confirmed' ? 'default' : booking.bookingStatus === 'cancelled' ? 'destructive' : 'secondary'}>
                    {statusLabel(booking.bookingStatus)}
                  </Badge>
                  {booking.bookingStatus === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' })}
                        disabled={updateStatus.isPending} data-testid={`button-approve-${booking.id}`}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
                        disabled={updateStatus.isPending} data-testid={`button-reject-${booking.id}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {allBookings.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhuma reserva.</div>}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
