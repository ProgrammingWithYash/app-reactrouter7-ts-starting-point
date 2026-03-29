import crypto from "crypto"
import { redirect } from "react-router"
import type { Route } from "./+types/auth-initial"
import { authStateCookie } from "~/cookies.server"

export async function loader({ request }: Route.LoaderArgs) {
	console.log("[auth-initial] loader started", request.url)
	let url = new URL(request.url)
	const urlParams = url.searchParams.get.bind(url.searchParams)

	const hmac = urlParams("hmac") as string;
	url.searchParams.delete("hmac");
	console.log("[auth-initial] hmac:", hmac)

	const sorted = [...url.searchParams.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("&")
	console.log("[auth-initial] sorted params string:", sorted)

	if (!process.env.FLICKSELL_API_SECRET) {
		console.log("[auth-initial] ERROR: missing FLICKSELL_API_SECRET")
		throw new Response("Server configuration error", { status: 500 });
	}

	const inputBuffer = crypto
		.createHmac("sha256", process.env.FLICKSELL_API_SECRET)
		.update(sorted)
		.digest()
	console.log("[auth-initial] computed hmac (base64url):", inputBuffer.toString('base64url'))

	const nonce = crypto.randomUUID()

	if (!hmac) {
		console.log("[auth-initial] ERROR: missing hmac param")
		throw new Response("Missing HMAC", { status: 400 });
	}

	const storedBuffer = Buffer.from(hmac, 'base64url');
	console.log("[auth-initial] buffer lengths — computed:", inputBuffer.length, "stored:", storedBuffer.length)

	if (inputBuffer.length !== storedBuffer.length || !crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
		console.log("[auth-initial] ERROR: HMAC mismatch")
		throw new Response("Invalid HMAC", { status: 403 });
	}

	const shop = urlParams("shop");
	console.log("[auth-initial] shop:", shop)
	if (!shop) {
		console.log("[auth-initial] ERROR: missing shop param")
		throw new Response("Missing shop parameter", { status: 400 });
	}

	if (!process.env.FLICKSELL_URL || !process.env.FLICKSELL_API_KEY) {
		console.log("[auth-initial] ERROR: missing FLICKSELL_URL or FLICKSELL_API_KEY")
		throw new Response("Server configuration error", { status: 500 });
	}

	const redirectUrl = new URL("/auth/final", url.origin);
	const shopUrl = (urlParams("shop") as string).split(".")[0];
	const authUrl = new URL(`${process.env.FLICKSELL_URL}/${shopUrl}/apps/authorize`);
	authUrl.searchParams.set("client_id", process.env.FLICKSELL_API_KEY);
	authUrl.searchParams.set("state", nonce);
	authUrl.searchParams.set("redirect_url", redirectUrl.toString());
	console.log("[auth-initial] redirecting to:", authUrl.toString())

	return redirect(authUrl.toString(), {
		headers: {
			"Set-Cookie": await authStateCookie.serialize(nonce)
		}
	})
}

export default function AuthInitial() {
	return <></>
}