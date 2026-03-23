import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("cliente"),
  status: varchar("status").default("pending"),
  profileCompleted: varchar("profile_completed").default("false"),
  documento: varchar("documento"),
  contacto: varchar("contacto"),
  dataNascimento: varchar("data_nascimento"),
  nacionalidade: varchar("nacionalidade"),
  nuit: varchar("nuit"),
  cartaNumero: varchar("carta_numero"),
  cartaEmissao: varchar("carta_emissao"),
  cartaValidade: varchar("carta_validade"),
  cartaPaisEmissor: varchar("carta_pais_emissor"),
  cartaFotoUrl: varchar("carta_foto_url"),
  enderecoCidade: varchar("endereco_cidade"),
  enderecoBairro: varchar("endereco_bairro"),
  enderecoNumeroCasa: varchar("endereco_numero_casa"),
  enderecoPais: varchar("endereco_pais"),
  aceitouTermos: varchar("aceitou_termos").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
