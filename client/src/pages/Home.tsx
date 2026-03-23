import { Link } from "wouter";
import { useCars } from "@/hooks/use-cars";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { data: cars, isLoading } = useCars();
  const { data: availabilityDates } = useQuery<Record<string, string>>({
    queryKey: ["/api/cars/availability-dates"],
  });

  // Show only 3 featured cars
  const featuredCars = cars?.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              Explore Moçambique <br />
              <span className="text-primary">À sua maneira.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300 mb-8">
              Aluguer de viaturas premium em Maputo, Beira e Nampula.
              Experimente a liberdade da estrada com a nossa frota fiável de
              SUVs e sedans.
            </p>
            <div className="flex items-center gap-x-6">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                asChild
              >
                <Link href="/cars">Ver Frota</Link>
              </Button>
              <Button
                variant="link"
                className="text-white hover:text-primary"
                asChild
              >
                <Link href="/about">
                  Saiba mais <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                Reserva Fácil
              </h3>
              <p className="text-muted-foreground">
                Reserve em minutos com o nosso portal online simplificado.
                Confirmação instantânea.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                Pagamentos Locais
              </h3>
              <p className="text-muted-foreground">
                Pague convenientemente com M-Pesa, E-Mola ou Cartão de Crédito.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                Suporte Premium
              </h3>
              <p className="text-muted-foreground">
                Assistência rodoviária 24/7 em todas as principais províncias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Viaturas em Destaque
            </h2>
            <p className="mt-4 text-muted-foreground">
              Escolha entre os nossos alugueres mais populares.
            </p>
          </div>
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/cars">
              Ver Todas as Viaturas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))
            : featuredCars?.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  availableDate={availabilityDates?.[String(car.id)]}
                />
              ))}
        </div>

        <div className="mt-12 text-center sm:hidden">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/cars">Ver Todas as Viaturas</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-display text-2xl font-bold text-white">
              UMBRELLA CORPORATION SU LDA MZ
            </span>
            <p className="mt-4 max-w-sm">
              O principal serviço de aluguer de viaturas em Moçambique.
              Fornecendo veículos fiáveis, confortáveis e acessíveis para a sua
              viagem.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/cars"
                  className="hover:text-primary transition-colors"
                >
                  Frota
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Localizações</h4>
            <ul className="space-y-2">
              <li>Maputo</li>
              <li>Beira</li>
              <li>Nampula</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} BookCars Moçambique. Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
  );
}
