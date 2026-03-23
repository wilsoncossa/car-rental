import { Link } from "wouter";
import { type Car } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Fuel, Gauge, CalendarClock } from "lucide-react";

interface CarCardProps {
  car: Car;
  availableDate?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
}

export function CarCard({ car, availableDate }: CarCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          data-testid={`img-car-${car.id}`}
        />
        <div className="absolute top-3 right-3 z-20">
          <Badge variant={car.isAvailable ? "default" : "secondary"} className={car.isAvailable ? "bg-emerald-500 hover:bg-emerald-600" : ""} data-testid={`badge-availability-${car.id}`}>
            {car.isAvailable ? "Disponível" : "Alugado"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 z-20 text-white">
          <h3 className="font-display text-lg font-bold" data-testid={`text-car-name-${car.id}`}>{car.make} {car.model}</h3>
          <p className="text-xs text-white/80">{car.year} • {car.type}</p>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            {car.city}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4 text-primary" />
            5 Lugares
          </div>
          <div className="flex items-center text-muted-foreground">
            <Fuel className="mr-2 h-4 w-4 text-primary" />
            Gasolina
          </div>
          <div className="flex items-center text-muted-foreground">
            <Gauge className="mr-2 h-4 w-4 text-primary" />
            Automático
          </div>
        </div>
        {!car.isAvailable && availableDate && (
          <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800" data-testid={`text-available-date-${car.id}`}>
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span>Disponível a partir de <strong>{formatDate(availableDate)}</strong></span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t bg-muted/20 p-4">
        <div>
          <p className="text-sm text-muted-foreground">Diária</p>
          <p className="font-display text-xl font-bold text-primary" data-testid={`text-price-${car.id}`}>
            {Number(car.dailyRate).toLocaleString('pt-MZ')} MZN
          </p>
        </div>
        
        <Link href={`/cars/${car.id}`}>
          <Button disabled={!car.isAvailable} className="font-semibold shadow-lg shadow-primary/20" data-testid={`button-book-${car.id}`}>
            {car.isAvailable ? "Reservar" : "Indisponível"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
