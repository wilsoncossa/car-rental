import { useAdminStats, useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign, Calendar, Activity, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const { toast } = useToast();

  const handleStatusUpdate = (id: number, status: 'confirmed' | 'cancelled') => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => {
        toast({
          title: status === 'confirmed' ? "Reserva Aprovada" : "Reserva Recusada",
          description: `A reserva foi ${status === 'confirmed' ? 'confirmada' : 'cancelada'} com sucesso.`,
        });
      },
    });
  };

  if (statsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform revenue data for chart
  const chartData = stats ? Object.entries(stats.revenueByMethod).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: Number(value)
  })) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">Painel de Administração</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(stats?.totalRevenue || 0).toLocaleString()} MZN</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeBookings}</div>
              <p className="text-xs text-muted-foreground">Currently on the road</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings}</div>
              <p className="text-xs text-muted-foreground">Lifetime reservations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="bookings">Reservas Recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                      <Tooltip />
                      <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {bookings?.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {booking.car?.make} {booking.car?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">{Number(booking.totalPrice).toLocaleString()} MZN</div>
                          <p className="text-xs text-muted-foreground uppercase">{booking.paymentMethod}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={booking.bookingStatus === 'confirmed' ? 'default' : booking.bookingStatus === 'cancelled' ? 'destructive' : 'secondary'}>
                            {booking.bookingStatus}
                          </Badge>
                          {booking.bookingStatus === 'pending' && (
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                disabled={updateStatus.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                disabled={updateStatus.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
