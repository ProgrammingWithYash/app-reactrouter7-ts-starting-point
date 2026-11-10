import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/settings";
import { flicksell as server } from "~/flicksell.server";
import { getSettings } from "~/db/store.server";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Settings" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const { session } = await server.authenticate.admin(request);
	return { shop: session.shop, settings: await getSettings(session.shop) };
}

export default function Settings({ loaderData }: Route.ComponentProps) {
	const saved = loaderData.settings;
	const revalidator = useRevalidator();
	const [listName, setListName] = useState(saved.listName);
	const [hideDone, setHideDone] = useState(saved.hideDone);

	const dirty = listName !== saved.listName || hideDone !== saved.hideDone;

	useEffect(() => {
		flicksell.titleBar.set({ title: "Settings" });
	}, []);

	// Unsaved changes bring up admin's own save bar, which also stops the person
	// leaving by accident. Its buttons call back here.
	useEffect(() => {
		if (!dirty) {
			flicksell.saveBar.hide();
			return;
		}
		flicksell.saveBar.show({
			onSave: async () => {
				const response = await fetch("/api/settings", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ listName, hideDone }),
				});
				const result = await response.json() as { success: boolean; message?: string };
				if (result.success) await revalidator.revalidate();
				return result.success ? { success: true, message: "Settings saved" } : result;
			},
			onDiscard: () => {
				setListName(saved.listName);
				setHideDone(saved.hideDone);
			},
		});
	}, [dirty, listName, hideDone, saved.listName, saved.hideDone]);

	// Leaving the page with the bar up would leave it up for the next one.
	useEffect(() => () => flicksell.saveBar.hide(), []);

	return (
		<main className="mx-auto max-w-2xl p-6 text-sm">
			<p className="text-gray-600">Connected to {loaderData.shop}</p>

			<label className="mt-4 block">
				<span className="font-medium">List name</span>
				<input value={listName} onChange={(event) => setListName(event.currentTarget.value)}
					className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" />
			</label>

			<label className="mt-4 flex items-center gap-2">
				<input type="checkbox" checked={hideDone} onChange={(event) => setHideDone(event.currentTarget.checked)} />
				Hide completed todos
			</label>
		</main>
	);
}
