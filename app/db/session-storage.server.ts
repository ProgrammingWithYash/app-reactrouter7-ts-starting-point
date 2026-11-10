import { Session, type SessionStorage } from "@flicksell/api";
import { eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { sessions } from "./schema/schema";

type Row = typeof sessions.$inferSelect;

function toSession(row: Row): Session {
	return new Session({
		id: row.id,
		shop: row.shop,
		siteId: row.siteId,
		isOnline: row.isOnline,
		scope: row.scope ?? undefined,
		expires: row.expires ?? undefined,
		accessToken: row.accessToken ?? undefined,
		refreshToken: row.refreshToken ?? undefined,
		refreshTokenExpires: row.refreshTokenExpires ?? undefined,
		onlineAccessInfo: row.onlineAccessInfo ?? undefined,
	});
}

/** Where @flicksell/api keeps access tokens between requests: the sessions table. */
export const sessionStorage: SessionStorage = {
	async storeSession(session) {
		const row = {
			id: session.id,
			shop: session.shop,
			siteId: session.siteId,
			isOnline: session.isOnline,
			scope: session.scope ?? null,
			expires: session.expires ?? null,
			accessToken: session.accessToken ?? null,
			refreshToken: session.refreshToken ?? null,
			refreshTokenExpires: session.refreshTokenExpires ?? null,
			onlineAccessInfo: session.onlineAccessInfo ?? null,
		};
		await db.insert(sessions).values(row).onConflictDoUpdate({ target: sessions.id, set: row });
		return true;
	},

	async loadSession(id) {
		const [row] = await db.select().from(sessions).where(eq(sessions.id, id));
		return row ? toSession(row) : undefined;
	},

	async deleteSession(id) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return true;
	},

	async deleteSessions(ids) {
		if (ids.length > 0) await db.delete(sessions).where(inArray(sessions.id, ids));
		return true;
	},

	async findSessionsByShop(shop) {
		const rows = await db.select().from(sessions).where(eq(sessions.shop, shop));
		return rows.map(toSession);
	},
};
