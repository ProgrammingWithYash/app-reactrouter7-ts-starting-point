import { pgTable, varchar, boolean, timestamp, bigint, serial } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	shop: varchar("shop", { length: 255 }).notNull().unique(),
	isOnline: boolean("is_online").notNull().default(false),
	scope: varchar("scope", { length: 500 }),
	expiresAt: timestamp("expires_at"),
	accessToken: varchar("access_token", { length: 500 }).notNull(),
	userId: bigint("user_id", { mode: "number" }),
	refreshToken: varchar("refresh_token", { length: 500 }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow()
})
