import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	shop: text("shop").notNull().unique(),
	isOnline: integer("is_online", {mode: "boolean"}).notNull().default(false),
	scope: text("scope"),
	expiresAt: integer("expires_at", {mode: "timestamp"}),
	accessToken: text("access_token").notNull(),
	userId: integer("user_id"), // Bigint
	refreshToken: text("refresh_token"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {mode: "timestamp"}),
	createdAt: integer("created_at", {mode: "timestamp"}).$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", {mode: "timestamp"}).$defaultFn(() => new Date())
})