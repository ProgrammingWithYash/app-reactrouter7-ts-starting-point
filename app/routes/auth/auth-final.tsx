import crypto from "crypto"
import { redirect } from "react-router"
import type { Route } from "./+types/auth-final"
import { authStateCookie } from "~/cookies.server"
import { db } from "~/db"
import { sessions } from "~/db/schema/schema"

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const urlParams = url.searchParams.get.bind(url.searchParams)

	const nonce = await authStateCookie.parse(request.headers.get("Cookie"))
	const nonceFromQuery = urlParams("state")
	if (nonce !== nonceFromQuery) {
		throw new Response("Invalid State", { status: 403 });
	}

	const shop = urlParams("shop");
	const hmac = urlParams("hmac");
	const code = urlParams("code");

	if (!shop || !hmac || !code) {
		throw new Response("Missing required parameters", { status: 400 });
	}

	url.searchParams.delete("hmac");

	const sorted = [...url.searchParams.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("&")

	if (!process.env.FLICKSELL_API_SECRET) {
		throw new Response("Server configuration error", { status: 500 });
	}

	const inputBuffer = crypto
		.createHmac("sha256", process.env.FLICKSELL_API_SECRET)
		.update(sorted)
		.digest()
	const storedBuffer = Buffer.from(hmac, 'base64url');

	if (inputBuffer.length !== storedBuffer.length || !crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
		throw new Response("Invalid HMAC", { status: 403 });
	}

	if (!process.env.FLICKSELL_URL || !process.env.FLICKSELL_API_KEY) {
		throw new Response("Server configuration error", { status: 500 });
	}

	const response = await fetch(`${process.env.FLICKSELL_URL}/apps/exchange`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				client_id: process.env.FLICKSELL_API_KEY,
				client_secret: process.env.FLICKSELL_API_SECRET,
				code: code
			})
		})

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Token exchange failed:", errorText);
			throw new Response("Failed to exchange code for token", { status: 502 });
		}

	const { access_token, refresh_token, expires_at, created_at, scope } = await response.json();

	if (!access_token) {
		throw new Response("No access token received", { status: 502 });
	}

	await db.insert(sessions).values({
		shop: shop,
		accessToken: access_token,
		refreshToken: refresh_token ?? null,
		expiresAt: expires_at ? new Date(expires_at) : null,
		createdAt: created_at ? new Date(created_at * 1000) : new Date(),
		scope: scope,
		isOnline: false
	}).onConflictDoUpdate({
		target: sessions.shop,
		set: {
			accessToken: access_token,
			refreshToken: refresh_token ?? null,
			expiresAt: expires_at ? new Date(expires_at) : null,
			scope: scope,
			updatedAt: new Date()
		}
	})

		return redirect("/")
}

export default function AuthFinal() {
	return <></>
}