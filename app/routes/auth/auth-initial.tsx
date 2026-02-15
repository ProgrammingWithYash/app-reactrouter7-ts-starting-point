import crypto from "crypto"
import { redirect } from "react-router"
import type { Route } from "../../+types/root"
import { authStateCookie } from "~/cookies.server"

export async function loader({ request }: Route.LoaderArgs) {
	let url = new URL(request.url)
	const urlParams = url.searchParams.get

	const hmac = urlParams("hmac") as string;
	url.searchParams.delete("hmac");

	const sorted = [...url.searchParams.entries()]
		.sort(([a, b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("&")

	if (!process.env.FLICKSELL_API_SECRET) {
		throw new Response("Server configuration error", { status: 500 });
	}

	const computed = crypto
		.createHmac("sha256", process.env.FLICKSELL_API_SECRET)
		.update(sorted)
		.digest("hex")

	const nonce = crypto.randomUUID()

	if (!hmac) {
		throw new Response("Missing HMAC", { status: 400 });
	}

	const inputBuffer = Buffer.from(computed, 'hex');
	const storedBuffer = Buffer.from(hmac, 'hex');

	if (!crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
		throw new Response("Invalid HMAC", { status: 403 });
	}

	const shop = urlParams("shop");
	if (!shop) {
		throw new Response("Missing shop parameter", { status: 400 });
	}

	if (!process.env.FLICKSELL_URL || !process.env.FLICKSELL_API_KEY) {
		throw new Response("Server configuration error", { status: 500 });
	}

	const authUrl = new URL(`${process.env.FLICKSELL_URL}/oauth/authorize/${shop}`);
	authUrl.searchParams.set("client_id", process.env.FLICKSELL_API_KEY);
	authUrl.searchParams.set("state", nonce);

	return redirect(authUrl.toString(), {
		headers: {
			"Set-Cookie": await authStateCookie.serialize(nonce)
		}
	})
}

export default function AuthInitial() {
	return <></>
}