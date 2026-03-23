import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Car, type InsertCar } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getAuthHeaders } from "@/lib/queryClient";

export function useCars(filters?: { city?: string; type?: string; available?: boolean }) {
  const queryKey = [api.cars.list.path, filters?.city, filters?.type, filters?.available].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually since our buildUrl helper is for path params mainly
      const searchParams = new URLSearchParams();
      if (filters?.city) searchParams.append("city", filters.city);
      if (filters?.type) searchParams.append("type", filters.type);
      if (filters?.available !== undefined) searchParams.append("available", String(filters.available));
      
      const url = `${api.cars.list.path}?${searchParams.toString()}`;
      const headers = getAuthHeaders();
      const res = await fetch(url, { headers });
      
      if (!res.ok) throw new Error("Failed to fetch cars");
      return api.cars.list.responses[200].parse(await res.json());
    },
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: [api.cars.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cars.get.path, { id });
      const headers = getAuthHeaders();
      const res = await fetch(url, { headers });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch car");
      return api.cars.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (car: InsertCar) => {
      const validated = api.cars.create.input.parse(car);
      const res = await apiRequest(api.cars.create.method, api.cars.create.path, validated);
      return api.cars.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Viatura adicionada", description: "Nova viatura adicionada à frota com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCar>) => {
      const url = buildUrl(api.cars.update.path, { id });
      const res = await apiRequest(api.cars.update.method, url, updates);
      return api.cars.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.cars.get.path, variables.id] });
      toast({ title: "Viatura atualizada", description: "Alterações guardadas com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cars.delete.path, { id });
      const res = await apiRequest(api.cars.delete.method, url);
      // apiRequest throws on !ok, no need to check again here
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Viatura removida", description: "Viatura removida da frota com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
