import { drizzle } from "drizzle-orm/mysql2"

export const db = drizzle(process.env.DB_URL as string)