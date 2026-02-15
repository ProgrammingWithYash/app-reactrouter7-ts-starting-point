import { defineConfig } from "drizzle-kit";

const DB_URL = process.env.DB_URL || "./app.db";

// Auto-detect database type from URL
let DB_TYPE: "sqlite" | "mysql" | "postgres";
if (DB_URL.startsWith("mysql://")) {
	DB_TYPE = "mysql";
} else if (DB_URL.startsWith("postgres://") || DB_URL.startsWith("postgresql://")) {
	DB_TYPE = "postgres";
} else {
	DB_TYPE = "sqlite";
}

const configs = {
	sqlite: {
		schema: "./app/db/schema/schema.ts",
		out: "./drizzle",
		dialect: "sqlite" as const,
		dbCredentials: {
			url: DB_URL
		}
	},
	mysql: {
		schema: "./app/db/schema/schema-mysql.ts",
		out: "./drizzle",
		dialect: "mysql" as const,
		dbCredentials: {
			url: DB_URL
		}
	},
	postgres: {
		schema: "./app/db/schema/schema-postgres.ts",
		out: "./drizzle",
		dialect: "postgresql" as const,
		dbCredentials: {
			url: DB_URL
		}
	}
};

export default defineConfig(configs[DB_TYPE as keyof typeof configs]);