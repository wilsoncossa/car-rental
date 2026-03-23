import { useRoute, Link } from "wouter";
import { useCar } from "@/hooks/use-cars";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { BookingForm } from "@/components/BookingForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Info, CalendarClock } from "lucide-react";

export default function CarDetail() {
  const [, params] = useRoute("/cars/:id");
  const id = Number(params?.id);
  const { data: car, isLoading, error } = useCar(id);
  const { data: availabilityDates } = useQuery<Record<string, string>>({
    queryKey: ["/api/cars/availability-dates"],
  });
  const availableDate = availabilityDates?.[String(id)];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-3xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Car not found</h1>
        <Link href="/cars">
          <Button>Back to Fleet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link href="/cars">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fleet
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
              <img
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <Badge className={car.isAvailable ? "bg-emerald-500" : "bg-slate-500"} data-testid="badge-car-availability">
                  {car.isAvailable ? "Disponível" : "Alugado"}
                </Badge>
                {!car.isAvailable && availableDate && (
                  <div className="flex items-center gap-1.5 bg-amber-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm" data-testid="text-car-available-date">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Disponível a partir de {new Date(availableDate).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="font-display text-3xl font-bold text-slate-900">{car.make} {car.model}</h1>
                  <p className="text-lg text-muted-foreground mt-1">{car.year} • {car.type} • {car.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    {Number(car.dailyRate).toLocaleString()} <span className="text-base font-normal text-slate-500">MZN/day</span>
                  </p>
                </div>
              </div>

              <div className="prose max-w-none text-slate-600 mb-8">
                <h3 className="text-slate-900 font-bold mb-2">Description</h3>
                <p>{car.description || "A reliable vehicle perfect for city driving and long-distance travel across Mozambique."}</p>
              </div>

              <div>
                <h3 className="text-slate-900 font-bold mb-4">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features?.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                  {(!car.features || car.features.length === 0) && (
                    <div className="col-span-full text-muted-foreground text-sm italic flex items-center">
                      <Info className="w-4 h-4 mr-2" /> No specific features listed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm car={car} />
          </div>
        </div>
      </main>
    </div>
  );
}
