import { useEffect, useRef, useState } from "react";
import { Form, useFetcher } from "react-router";
import type { Route } from "./+types/home";
import { flicksell as server } from "~/flicksell.server";
import { addTodo, clearDone, getSettings, listTodos, setDone } from "~/db/store.server";

type Product = { id: string; title: string };

export function meta({}: Route.MetaArgs) {
	return [{ title: "Todos" }];
}

// Every request from admin carries a session token. authenticate checks it,
// gets an access token for the store if there isn't one yet, and hands back
// the store and a client for the Admin API.
export async function loader({ request }: Route.LoaderArgs) {
	const { admin, session } = await server.authenticate.admin(request);

	const [todos, settings, products] = await Promise.all([
		listTodos(session.shop),
		getSettings(session.shop),
		// The store's products, for linking a todo to one. A store that has not
		// given this app read_products simply has none to offer.
		admin
			.graphql<{ products: { nodes: Product[] } }>(`{ products(first: 25) { nodes { id title } } }`)
			.then((res) => res.data?.products.nodes ?? [])
			.catch(() => [] as Product[]),
	]);

	return { todos, settings, products };
}

export async function action({ request }: Route.ActionArgs) {
	const { session } = await server.authenticate.admin(request);
	const form = await request.formData();

	switch (form.get("intent")) {
		case "add": {
			const title = String(form.get("title") ?? "").trim();
			if (!title) return { error: "A todo needs a title." };
			await addTodo(session.shop, title, String(form.get("productTitle") ?? "") || null);
			return { added: title };
		}
		case "toggle":
			await setDone(session.shop, Number(form.get("id")), form.get("done") === "true");
			return {};
		case "clear":
			await clearDone(session.shop);
			return { cleared: true };
	}
	return {};
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
	const { todos, settings, products } = loaderData;
	const toggle = useFetcher();
	const clear = useFetcher();
	const title = useRef<HTMLInputElement>(null);
	const [product, setProduct] = useState<Product | null>(null);

	const shown = settings.hideDone ? todos.filter((todo) => !todo.done) : todos;
	const doneCount = todos.filter((todo) => todo.done).length;

	// The page's title and buttons live in admin's own header.
	useEffect(() => {
		flicksell.titleBar.set({
			title: settings.listName,
			primaryAction: { label: "New todo", onAction: () => title.current?.focus() },
			menuActions: [{
				label: "Clear completed",
				tone: "critical",
				disabled: doneCount === 0,
				onAction: () => clear.submit({ intent: "clear" }, { method: "post" }),
			}],
		});
	}, [settings.listName, doneCount]);

	useEffect(() => {
		if (actionData && "added" in actionData) {
			flicksell.toast(`Added "${actionData.added}"`, { tone: "success" });
			if (title.current) title.current.value = "";
			setProduct(null);
		}
		if (actionData && "error" in actionData) flicksell.toast(actionData.error!, { tone: "critical" });
	}, [actionData]);

	// Admin draws the picker; the app only supplies what can be picked.
	const pickProduct = async () => {
		const picked = await flicksell.picker({
			heading: "Link a product",
			items: products.map((item) => ({ id: item.id, label: item.title })),
		});
		if (picked) setProduct(products.find((item) => item.id === picked[0]) ?? null);
	};

	return (
		<main className="mx-auto max-w-2xl p-6 text-sm">
			<Form method="post" className="flex gap-2">
				<input type="hidden" name="intent" value="add" />
				<input type="hidden" name="productTitle" value={product?.title ?? ""} />
				<input ref={title} name="title" placeholder="What needs doing?" autoComplete="off"
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2" />
				{products.length > 0 && (
					<button type="button" onClick={pickProduct} className="rounded-lg border border-gray-300 px-3 py-2">
						{product ? product.title : "Link product"}
					</button>
				)}
				<button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-white">Add</button>
			</Form>

			<ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
				{shown.map((todo) => (
					<li key={todo.id} className="flex items-center gap-3 px-4 py-3">
						<input type="checkbox" checked={todo.done}
							onChange={(event) => toggle.submit(
								{ intent: "toggle", id: String(todo.id), done: String(event.currentTarget.checked) },
								{ method: "post" },
							)} />
						<span className={todo.done ? "text-gray-400 line-through" : ""}>{todo.title}</span>
						{todo.productTitle && <span className="ml-auto text-gray-500">{todo.productTitle}</span>}
					</li>
				))}
				{shown.length === 0 && <li className="px-4 py-3 text-gray-500">Nothing to do.</li>}
			</ul>
		</main>
	);
}
