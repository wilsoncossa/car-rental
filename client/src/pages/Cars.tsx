import { useState } from "react";
import { useCars } from "@/hooks/use-cars";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search } from "lucide-react";

export default function Cars() {
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState<string>("");
  
  const { data: cars, isLoading } = useCars({ 
    city: city === "all" ? undefined : city, 
    type: type === "all" ? undefined : type 
  });

  const { data: availabilityDates } = useQuery<Record<string, string>>({
    queryKey: ["/api/cars/availability-dates"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-slate-900">Nossa Frota</h1>
            
            <div className="flex w-full md:w-auto gap-2 overflow-x-auto pb-2 md:pb-0">
              <div className="min-w-[140px]">
                <Select onValueChange={setCity} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Localizações</SelectItem>
                    <SelectItem value="Maputo">Maputo</SelectItem>
                    <SelectItem value="Beira">Beira</SelectItem>
                    <SelectItem value="Nampula">Nampula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="min-w-[140px]">
                <Select onValueChange={setType} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="Pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : cars?.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Nenhum carro encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros para encontrar veículos disponíveis.</p>
            <Button 
              variant="outline" 
              className="mt-6" 
              onClick={() => { setCity("all"); setType("all"); }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars?.map((car) => (
              <CarCard key={car.id} car={car} availableDate={availabilityDates?.[String(car.id)]} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
