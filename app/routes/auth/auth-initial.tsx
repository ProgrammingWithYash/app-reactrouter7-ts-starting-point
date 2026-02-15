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

	if (!process.env.FLICKSELL_OAUTH_URL || !process.env.FLICKSELL_API_KEY || !process.env.FLICKSELL_SCOPES || !process.env.FLICKSELL_REDIRECT_URI) {
		throw new Response("Server configuration error", { status: 500 });
	}

	const authUrl = new URL(process.env.FLICKSELL_OAUTH_URL);
	authUrl.searchParams.set("client_id", process.env.FLICKSELL_API_KEY);
	authUrl.searchParams.set("scope", process.env.FLICKSELL_SCOPES);
	authUrl.searchParams.set("redirect_uri", process.env.FLICKSELL_REDIRECT_URI);
	authUrl.searchParams.set("state", nonce);
	authUrl.searchParams.set("shop", shop);

	return redirect(authUrl.toString(), {
		headers: {
			"Set-Cookie": await authStateCookie.serialize(nonce)
		}
	})
}

export default function AuthInitial() {
	return <></>
}