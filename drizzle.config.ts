import { defineConfig } from "drizzle-kit";

const DB_TYPE = process.env.DB_TYPE || "sqlite";

const configs = {
	sqlite: {
		schema: "./app/db/schema/schema.ts",
		out: "./drizzle",
		dialect: "sqlite" as const,
		dbCredentials: {
			url: process.env.DB_URL || "./app.db"
		}
	},
	mysql: {
		schema: "./app/db/schema/schema-mysql.ts",
		out: "./drizzle",
		dialect: "mysql" as const,
		dbCredentials: {
			url: process.env.DB_URL!
		}
	},
	postgres: {
		schema: "./app/db/schema/schema-postgres.ts",
		out: "./drizzle",
		dialect: "postgresql" as const,
		dbCredentials: {
			url: process.env.DB_URL!
		}
	}
};

export default defineConfig(configs[DB_TYPE as keyof typeof configs]);