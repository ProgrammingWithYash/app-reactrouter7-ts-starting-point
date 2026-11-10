import { and, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { settings, todos } from "./schema/schema";

// The example app's data, always for one store: every read and write names the shop.

export type Settings = { listName: string; hideDone: boolean };

export async function getSettings(shop: string): Promise<Settings> {
	const [row] = await db.select().from(settings).where(eq(settings.shop, shop));
	return { listName: row?.listName ?? "Todos", hideDone: row?.hideDone ?? false };
}

export async function saveSettings(shop: string, value: Settings) {
	await db.insert(settings).values({ shop, ...value }).onConflictDoUpdate({ target: settings.shop, set: value });
}

export function listTodos(shop: string) {
	return db.select().from(todos).where(eq(todos.shop, shop)).orderBy(desc(todos.createdAt));
}

export async function addTodo(shop: string, title: string, productTitle: string | null) {
	await db.insert(todos).values({ shop, title, productTitle });
}

export async function setDone(shop: string, id: number, done: boolean) {
	await db.update(todos).set({ done }).where(and(eq(todos.shop, shop), eq(todos.id, id)));
}

export async function clearDone(shop: string) {
	await db.delete(todos).where(and(eq(todos.shop, shop), eq(todos.done, true)));
}
