import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBooking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getAuthHeaders } from "@/lib/queryClient";

export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const res = await fetch(api.bookings.list.path, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch bookings");
      }
      return api.bookings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const validated = api.bookings.create.input.parse(booking);
      const res = await apiRequest(api.bookings.create.method, api.bookings.create.path, validated);
      return api.bookings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      toast({ title: "Booking successful!", description: "Your car has been reserved." });
    },
    onError: (error) => {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'confirmed' | 'cancelled' | 'completed' }) => {
      const url = buildUrl(api.bookings.updateStatus.path, { id });
      const res = await apiRequest(api.bookings.updateStatus.method, url, { bookingStatus: status });
      return api.bookings.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      toast({ title: "Status updated", description: "Booking status has been changed." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const res = await fetch(api.stats.get.path, { headers });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
  });
}
