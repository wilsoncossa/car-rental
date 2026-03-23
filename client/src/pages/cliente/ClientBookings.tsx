import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ClientBookings() {
  const { data: bookings, isLoading } = useQuery({ queryKey: ['/api/bookings'] });

  if (isLoading) {
    return (
      <DashboardLayout title="Minhas Reservas">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const bookingsList = (bookings as any[]) || [];

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Concluída' };
    return map[s] || s;
  };

  return (
    <DashboardLayout title="Minhas Reservas" subtitle="Histórico das suas reservas de viaturas">
      {bookingsList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
          <h3 className="font-bold text-lg mb-2">Sem reservas</h3>
          <p className="text-muted-foreground mb-4">Ainda não fez nenhuma reserva.</p>
          <Button asChild><Link href="/cars">Ver Viaturas</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookingsList.map((booking: any) => (
            <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary" data-testid={`card-booking-${booking.id}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100">
                    {booking.car && <img src={booking.car.imageUrl} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="font-bold">{booking.car?.make} {booking.car?.model}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-1" />{booking.car?.city}
                      </div>
                      <Badge variant="outline" className="mt-2 capitalize">{statusLabel(booking.bookingStatus)}</Badge>
                    </div>
                    <div>
                      <div className="flex items-center text-sm mb-1"><Calendar className="w-4 h-4 mr-2 text-primary" /><span className="font-medium">Datas</span></div>
                      <p className="text-sm">{format(new Date(booking.startDate), "dd/MM/yyyy")} — {format(new Date(booking.endDate), "dd/MM/yyyy")}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm mb-1"><Clock className="w-4 h-4 mr-2 text-primary" /><span className="font-medium">Custo</span></div>
                      <p className="font-bold text-lg">{Number(booking.totalPrice).toLocaleString()} MZN</p>
                      <p className="text-xs text-muted-foreground capitalize">Via {booking.paymentMethod}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">ID da Reserva</p>
                        <p className="font-mono text-sm">#{booking.id.toString().padStart(6, '0')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
