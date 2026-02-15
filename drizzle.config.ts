import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./app/db/schema/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	dbCredentials: {
		url: "./app.db"
	}
});