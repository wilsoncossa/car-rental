import { db } from "./db";
import { cars, users, bookings, fines } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const FLEET_DATA = [
  {
    make: "Toyota",
    model: "Fortuner",
    year: 2023,
    licensePlate: "MMT-123-MC",
    type: "SUV",
    dailyRate: "5000",
    pricePerKm: "20",
    imageUrl: "https://images.unsplash.com/photo-1625231334168-30f9edfc5c7a?w=800&h=500&fit=crop",
    city: "Maputo",
    description: "Perfeito para viagens familiares e aventuras off-road.",
    features: ["AC", "Bluetooth", "4x4", "7 Lugares"],
  },
  {
    make: "Toyota",
    model: "Corolla",
    year: 2021,
    licensePlate: "ABG-456-MP",
    type: "Sedan",
    dailyRate: "3000",
    pricePerKm: "15",
    imageUrl: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&h=500&fit=crop",
    city: "Beira",
    description: "Económico e confortável para condução urbana.",
    features: ["AC", "Bluetooth", "Automático"],
  },
  {
    make: "Ford",
    model: "Ranger",
    year: 2022,
    licensePlate: "ADF-789-NP",
    type: "Pickup",
    dailyRate: "6000",
    pricePerKm: "25",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=500&fit=crop",
    city: "Nampula",
    description: "Pickup robusta para cargas pesadas e terreno difícil.",
    features: ["AC", "4x4", "Barra de Reboque"],
  },
  {
    make: "Hyundai",
    model: "Tucson",
    year: 2023,
    licensePlate: "MTX-321-MP",
    type: "SUV",
    dailyRate: "4500",
    pricePerKm: "18",
    imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop",
    city: "Maputo",
    description: "SUV moderno com tecnologia de ponta e conforto superior.",
    features: ["AC", "Bluetooth", "Câmera Traseira", "Sensores"],
  },
  {
    make: "Nissan",
    model: "NP300",
    year: 2022,
    licensePlate: "BRA-654-BR",
    type: "Pickup",
    dailyRate: "5500",
    pricePerKm: "22",
    imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=500&fit=crop",
    city: "Beira",
    description: "Pickup versátil ideal para trabalho e lazer.",
    features: ["AC", "4x4", "Cabine Dupla"],
  },
  {
    make: "Toyota",
    model: "Hilux",
    year: 2023,
    licensePlate: "NPL-987-NP",
    type: "Pickup",
    dailyRate: "6500",
    pricePerKm: "24",
    imageUrl: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&h=500&fit=crop",
    city: "Nampula",
    description: "A lendária Hilux — resistência comprovada em todo o terreno.",
    features: ["AC", "4x4", "Bluetooth", "Cabine Dupla"],
  },
  {
    make: "Suzuki",
    model: "Swift",
    year: 2021,
    licensePlate: "MPT-111-MC",
    type: "Económico",
    dailyRate: "2000",
    pricePerKm: "10",
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=500&fit=crop",
    city: "Maputo",
    description: "Compacto e económico, perfeito para a cidade.",
    features: ["AC", "Bluetooth", "Consumo Baixo"],
  },
  {
    make: "Honda",
    model: "Civic",
    year: 2022,
    licensePlate: "BRA-222-BR",
    type: "Sedan",
    dailyRate: "3500",
    pricePerKm: "16",
    imageUrl: "https://images.unsplash.com/photo-1679420437519-f0e4c0caaca4?w=800&h=500&fit=crop",
    city: "Beira",
    description: "Sedan desportivo com excelente performance e conforto.",
    features: ["AC", "Bluetooth", "Automático", "Ecrã Táctil"],
  },
  {
    make: "Mitsubishi",
    model: "Pajero",
    year: 2023,
    licensePlate: "NPL-333-NP",
    type: "SUV",
    dailyRate: "7000",
    pricePerKm: "28",
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop",
    city: "Nampula",
    description: "SUV premium para longas viagens com máximo conforto.",
    features: ["AC", "4x4", "Bluetooth", "7 Lugares", "Câmera 360°"],
  },
];

export async function seedDatabase() {
  await seedAdminUser();
  await seedFleet();
}

async function seedAdminUser() {
  const adminId = "55012308";
  const adminEmail = "admin@umbrella.com";
  const adminPassword = "Admin@123";
  const superAdminEmail = "wilsonrafaelcossa@gmail.com";

  try {
    const existingUser = await db.select().from(users).where(eq(users.id, adminId));

    if (existingUser.length > 0) {
      const user = existingUser[0];
      if (user.role !== "admin" || user.status !== "active" || user.profileCompleted !== "true") {
        console.log("[seed] Promoting existing user to admin...");
        await db.update(users).set({
          role: "admin",
          status: "active",
          profileCompleted: "true",
        }).where(eq(users.id, adminId));
        console.log("[seed] Admin user updated.");
      }
    }

    const userByEmail = await db.select().from(users).where(eq(users.email, superAdminEmail));
    if (userByEmail.length > 0) {
      const user = userByEmail[0];
      if (user.role !== "admin" || user.status !== "active" || user.profileCompleted !== "true") {
        console.log(`[seed] Promovendo ${superAdminEmail} para admin...`);
        await db.update(users).set({
          role: "admin",
          status: "active",
          profileCompleted: "true",
        }).where(eq(users.email, superAdminEmail));
        console.log(`[seed] Usuário ${superAdminEmail} atualizado para admin.`);
      }
    }

    if (existingUser.length > 0) {
      return;
    }

    console.log("[seed] Admin user not found, creating default admin user...");
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      passwordHash,
      firstName: "Admin",
      lastName: "Umbrella",
      role: "admin",
      status: "active",
      profileCompleted: "true",
    }).onConflictDoNothing();

    console.log("[seed] Default admin user created:", adminEmail, " /", adminPassword);
  } catch (error) {
    console.error("[seed] Error setting up admin user:", error);
  }
}

async function seedFleet() {
  try {
    const existingCars = await db.select({ id: cars.id, description: cars.description }).from(cars);

    const hasOldEnglishData = existingCars.some(c =>
      c.description?.includes("Perfect for") ||
      c.description?.includes("Fuel efficient") ||
      c.description?.includes("Robust pickup")
    );
    const needsSeed = existingCars.length === 0;

    if (hasOldEnglishData) {
      console.log("[seed] Detected old English car data. Updating fleet...");
      await db.delete(fines);
      await db.delete(bookings);
      await db.delete(cars);
      console.log("[seed] Old data cleared.");
    }

    if (needsSeed || hasOldEnglishData) {
      console.log("[seed] Inserting 9 cars into the fleet...");
      for (const car of FLEET_DATA) {
        await db.insert(cars).values(car).onConflictDoNothing();
      }
      console.log("[seed] Fleet seeded successfully with " + FLEET_DATA.length + " cars.");
    } else {
      console.log("[seed] Fleet data already up to date (" + existingCars.length + " cars), skipping.");
    }
  } catch (error) {
    console.error("[seed] Error during fleet seeding:", error);
  }
}
