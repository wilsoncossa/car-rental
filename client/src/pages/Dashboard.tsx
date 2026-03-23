import { useBookings } from "@/hooks/use-bookings";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useBookings();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user?.firstName}. Here are your reservations.</p>
        </div>

        {isLoading ? (
           <div className="space-y-4">
             <Skeleton className="h-32 w-full rounded-xl" />
             <Skeleton className="h-32 w-full rounded-xl" />
           </div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
            <h3 className="font-bold text-lg mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">You haven't made any reservations yet.</p>
            {/* Add Link to cars here */}
          </div>
        ) : (
          <div className="space-y-6">
            {bookings?.map((booking) => (
              <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Car Image Thumbnail */}
                    <div className="w-full md:w-48 h-32 md:h-auto relative bg-slate-100">
                      {booking.car ? (
                        <img 
                          src={booking.car.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt="Car"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <h3 className="font-bold text-lg">{booking.car?.make} {booking.car?.model}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.car?.city}
                        </div>
                        <Badge variant="outline" className="mt-3 capitalize">
                          {booking.bookingStatus}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-2 text-primary" />
                          <span className="font-medium">Dates</span>
                        </div>
                        <p className="text-sm">
                          {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center text-sm mb-2">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          <span className="font-medium">Total Cost</span>
                        </div>
                        <p className="font-bold text-lg">
                          {Number(booking.totalPrice).toLocaleString()} MZN
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">Via {booking.paymentMethod}</p>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        {/* Action buttons could go here (Cancel, etc) */}
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Booking ID</p>
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
      </main>
    </div>
  );
}
