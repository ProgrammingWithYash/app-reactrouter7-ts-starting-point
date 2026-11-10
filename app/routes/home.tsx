import type { Route } from "./+types/home";
import { flicksell } from "~/flicksell.server";

type Product = { id: string; title: string; status: string };

export function meta({}: Route.MetaArgs) {
	return [{ title: "Flicksell app" }];
}

// Flicksell loads this page inside admin with a session token. authenticate
// checks it, gets an access token for the store if there isn't one yet, and
// hands back a client for the Admin API.
export async function loader({ request }: Route.LoaderArgs) {
	const { admin, session } = await flicksell.authenticate.admin(request);

	const { data, errors } = await admin.graphql<{ products: { nodes: Product[] } }>(
		`{ products(first: 10) { nodes { id title status } } }`,
	);

	return {
		shop: session.shop,
		products: data?.products.nodes ?? [],
		error: errors?.[0]?.message ?? null,
	};
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { shop, products, error } = loaderData;

	return (
		<main className="mx-auto max-w-2xl p-6">
			<h1 className="text-lg font-semibold">Connected to {shop}</h1>
			<p className="mt-1 text-sm text-gray-600">
				This list comes from the Admin API, using this app's access token.
			</p>

			{error && <p className="mt-4 text-sm text-red-600">{error}</p>}

			<ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
				{products.map((product) => (
					<li key={product.id} className="flex items-center justify-between px-4 py-3 text-sm">
						<span>{product.title}</span>
						<span className="text-gray-500">{product.status}</span>
					</li>
				))}
				{products.length === 0 && !error && (
					<li className="px-4 py-3 text-sm text-gray-500">This store has no products yet.</li>
				)}
			</ul>
		</main>
	);
}
