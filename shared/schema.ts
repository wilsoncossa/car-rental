import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/auth";
import { users } from "./models/auth";

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  licensePlate: text("license_plate").notNull().unique(),
  type: text("type").notNull(),
  dailyRate: numeric("daily_rate").notNull(),
  pricePerKm: numeric("price_per_km").notNull(),
  imageUrl: text("image_url").notNull(),
  city: text("city").notNull(),
  description: text("description"),
  features: jsonb("features").$type<string[]>(),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  carId: integer("car_id").notNull().references(() => cars.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  estimatedKm: integer("estimated_km").notNull(),
  totalPrice: numeric("total_price").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").default("pending"),
  bookingStatus: text("booking_status").default("pending"),
  paymentPhoneNumber: text("payment_phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  car: one(cars, {
    fields: [bookings.carId],
    references: [cars.id],
  }),
}));

export const carsRelations = relations(cars, ({ many }) => ({
  bookings: many(bookings),
}));

export const finesRelations = relations(fines, ({ one }) => ({
  booking: one(bookings, {
    fields: [fines.bookingId],
    references: [bookings.id],
  }),
}));

export const insertCarSchema = createInsertSchema(cars).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  features: z.array(z.string()).optional(),
  dailyRate: z.number().or(z.string()).pipe(z.coerce.number()),
  pricePerKm: z.number().or(z.string()).pipe(z.coerce.number()),
  year: z.number().or(z.string()).pipe(z.coerce.number()),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true,
  userId: true,
  totalPrice: true,
  paymentStatus: true,
  bookingStatus: true
}).extend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  estimatedKm: z.number().or(z.string()).pipe(z.coerce.number()),
});

export const insertFineSchema = createInsertSchema(fines).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.number().or(z.string()).pipe(z.coerce.number()),
});

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Fine = typeof fines.$inferSelect;
export type InsertFine = z.infer<typeof insertFineSchema>;

export type CreateCarRequest = InsertCar;
export type UpdateCarRequest = Partial<InsertCar>;

export type CreateBookingRequest = InsertBooking;
export type UpdateBookingStatusRequest = { status: 'confirmed' | 'cancelled' | 'completed' };

export type CarResponse = Car;
export type BookingResponse = Booking & { car?: Car };

export interface CarQueryParams {
  city?: string;
  type?: string;
  available?: boolean;
}
