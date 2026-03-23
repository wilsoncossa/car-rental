import { db } from "./db";
import { cars, bookings, fines, users, type Car, type InsertCar, type Booking, type InsertBooking, type Fine, type InsertFine, type User } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getCars(filters?: { city?: string; type?: string; available?: boolean }): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, car: Partial<InsertCar>): Promise<Car>;
  deleteCar(id: number): Promise<void>;

  getBookings(userId?: string): Promise<(Booking & { car: Car | null })[]>;
  getAllBookings(): Promise<(Booking & { car: Car | null })[]>;
  getBooking(id: number): Promise<(Booking & { car: Car | null }) | undefined>;
  createBooking(booking: any): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;

  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: Partial<User>): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getClientUsers(): Promise<User[]>;

  getActiveBookingEndDates(): Promise<Record<number, string>>;

  getFines(userId?: string): Promise<Fine[]>;
  createFine(fine: InsertFine): Promise<Fine>;

  getStats(): Promise<{
    totalRevenue: number;
    totalBookings: number;
    activeBookings: number;
    totalUsers: number;
    revenueByMethod: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getCars(filters?: { city?: string; type?: string; available?: boolean }): Promise<Car[]> {
    let query = db.select().from(cars);
    const conditions = [];

    if (filters?.city) {
      conditions.push(eq(cars.city, filters.city));
    }
    if (filters?.type) {
      conditions.push(eq(cars.type, filters.type));
    }
    if (filters?.available !== undefined) {
      conditions.push(eq(cars.isAvailable, filters.available));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const [car] = await db.insert(cars).values(insertCar).returning();
    return car;
  }

  async updateCar(id: number, updateData: Partial<InsertCar>): Promise<Car> {
    const [car] = await db.update(cars).set(updateData).where(eq(cars.id, id)).returning();
    return car;
  }

  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }

  async getActiveBookingEndDates(): Promise<Record<number, string>> {
    const results = await db.select({
      carId: bookings.carId,
      endDate: bookings.endDate,
    })
    .from(bookings)
    .innerJoin(cars, eq(bookings.carId, cars.id))
    .where(
      and(
        eq(cars.isAvailable, false),
        sql`${bookings.bookingStatus} IN ('confirmed', 'pending')`
      )
    )
    .orderBy(desc(bookings.endDate));

    const map: Record<number, string> = {};
    for (const row of results) {
      if (!map[row.carId]) {
        map[row.carId] = row.endDate.toISOString();
      }
    }
    return map;
  }

  async getBookings(userId?: string): Promise<(Booking & { car: Car | null })[]> {
    if (userId) {
      const results = await db.select({
        booking: bookings,
        car: cars
      })
      .from(bookings)
      .leftJoin(cars, eq(bookings.carId, cars.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
      return results.map(row => ({ ...row.booking, car: row.car }));
    }
    return this.getAllBookings();
  }

  async getAllBookings(): Promise<(Booking & { car: Car | null })[]> {
    const results = await db.select({
      booking: bookings,
      car: cars
    })
    .from(bookings)
    .leftJoin(cars, eq(bookings.carId, cars.id))
    .orderBy(desc(bookings.createdAt));
    return results.map(row => ({ ...row.booking, car: row.car }));
  }

  async getBooking(id: number): Promise<(Booking & { car: Car | null }) | undefined> {
    const [result] = await db.select({
      booking: bookings,
      car: cars
    })
    .from(bookings)
    .leftJoin(cars, eq(bookings.carId, cars.id))
    .where(eq(bookings.id, id));

    if (!result) return undefined;
    return { ...result.booking, car: result.car };
  }

  async createBooking(insertBooking: any): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db.update(bookings)
      .set({ bookingStatus: status })
      .where(eq(bookings.id, id))
      .returning();

    if (booking) {
      if (status === 'confirmed') {
        await db.update(cars)
          .set({ isAvailable: false })
          .where(eq(cars.id, booking.carId));
      } else if (status === 'cancelled' || status === 'completed') {
        await db.update(cars)
          .set({ isAvailable: true })
          .where(eq(cars.id, booking.carId));
      }
    }

    return booking;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const [user] = await db.insert(users).values(data as any).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getClientUsers(): Promise<User[]> {
    return await db.select().from(users)
      .where(eq(users.role, 'cliente'))
      .orderBy(desc(users.createdAt));
  }

  async getFines(userId?: string): Promise<Fine[]> {
    if (userId) {
      return await db.select().from(fines)
        .where(eq(fines.userId, userId))
        .orderBy(desc(fines.createdAt));
    }
    return await db.select().from(fines).orderBy(desc(fines.createdAt));
  }

  async createFine(insertFine: InsertFine): Promise<Fine> {
    const [fine] = await db.insert(fines).values(insertFine).returning();
    return fine;
  }

  async getStats() {
    const allBookings = await db.select().from(bookings);
    const allUsers = await db.select().from(users);
    
    const totalRevenue = allBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter(b => b.bookingStatus === 'confirmed').length;
    const totalUsers = allUsers.length;
    
    const revenueByMethod = allBookings.reduce((acc, b) => {
      const method = b.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + Number(b.totalPrice);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalBookings,
      activeBookings,
      totalUsers,
      revenueByMethod
    };
  }
}

export const storage = new DatabaseStorage();
