import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { OnlineAccessInfo } from "@flicksell/api";

// One row per session, keyed the way @flicksell/api names them: the app's own
// session on a store is "offline_<shop>", a user's is "<shop>_<user id>". So a
// store can hold both at once.
export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	shop: text("shop").notNull(),
	siteId: integer("site_id").notNull(),
	isOnline: integer("is_online", { mode: "boolean" }).notNull().default(false),
	scope: text("scope"),
	expires: integer("expires", { mode: "timestamp_ms" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	refreshTokenExpires: integer("refresh_token_expires", { mode: "timestamp_ms" }),
	onlineAccessInfo: text("online_access_info", { mode: "json" }).$type<OnlineAccessInfo>(),
});
