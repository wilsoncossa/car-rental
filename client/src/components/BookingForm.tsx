import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Calculator, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateBooking } from "@/hooks/use-bookings";
import { type Car } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BookingFormProps {
  car: Car;
}

const formSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  estimatedKm: z.coerce.number().min(1, "Please enter estimated KM"),
  paymentMethod: z.enum(["mpesa", "emola", "card"]),
  phoneNumber: z.string().optional(),
});

export function BookingForm({ car }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimatedKm: 100,
      paymentMethod: "mpesa",
    },
  });

  // Calculate price whenever values change
  const calculatePrice = () => {
    const values = form.getValues();
    if (values.dateRange?.from && values.dateRange?.to && values.estimatedKm) {
      const days = differenceInDays(values.dateRange.to, values.dateRange.from) + 1;
      const rateTotal = days * Number(car.dailyRate);
      const kmTotal = values.estimatedKm * Number(car.pricePerKm);
      setTotalPrice(rateTotal + kmTotal);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      setTimeout(() => window.location.href = "/api/login", 1500);
      return;
    }

    createBooking.mutate({
      carId: car.id,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
      estimatedKm: data.estimatedKm,
      paymentMethod: data.paymentMethod,
      paymentPhoneNumber: data.phoneNumber,
    });
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5 sticky top-24">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="font-display text-xl">Booking Summary</CardTitle>
        <CardDescription>Reserve your {car.make} {car.model}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick your dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={(range) => {
                          field.onChange(range);
                          calculatePrice();
                        }}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Distance (KM)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calculator className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="100" 
                        className="pl-9" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          calculatePrice();
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {Number(car.pricePerKm)} MZN per additional KM
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {totalPrice > 0 && (
              <div className="space-y-2 rounded-lg bg-primary/5 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily Rate ({differenceInDays(form.getValues().dateRange.to, form.getValues().dateRange.from) + 1} days)</span>
                  <span>{((differenceInDays(form.getValues().dateRange.to, form.getValues().dateRange.from) + 1) * Number(car.dailyRate)).toLocaleString()} MZN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance Cost</span>
                  <span>{(form.getValues().estimatedKm * Number(car.pricePerKm)).toLocaleString()} MZN</span>
                </div>
                <Separator className="my-2 bg-primary/20" />
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString()} MZN</span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="emola">E-Mola</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch("paymentMethod") === "mpesa" || form.watch("paymentMethod") === "emola") && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="84 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold shadow-xl shadow-primary/20"
              disabled={createBooking.isPending || totalPrice === 0}
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
