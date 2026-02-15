import crypto from "crypto"
import { redirect } from "react-router"
import type { Route } from "../../+types/root"
import { authStateCookie } from "~/cookies.server"
import { db } from "~/db"
import { sessions } from "~/db/schema/schema"

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const urlParams = url.searchParams.get

	const nonce = await authStateCookie.parse(request.headers.get("Cookie"))
	const nonceFromQuery = urlParams("state")
	if (nonce != nonceFromQuery) {
		throw new Response("Invalid State", { status: 403 });
	}

	const shop = urlParams("shop")
	const hmac = urlParams("hmac") as string;
	url.searchParams.delete("hmac");

	const sorted = [...url.searchParams.entries()]
		.sort(([a, b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("&")

	const computed = crypto
		.createHmac("sha256", process.env.API_SECRET as string)
		.update(sorted)
		.digest("hex")

	const inputBuffer = Buffer.from(computed, 'hex');
	const storedBuffer = Buffer.from(hmac, 'hex');
	if (crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
		const code = urlParams("code")

		const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				client_id: process.env.API_KEY as string,
				client_secret: process.env.API_SECRET as string,
				code: code as string
			})
		})

		const { access_token, scope } = await response.json()

		await db.insert(sessions).values({
			shop: shop as string,
			accessToken: access_token,
			scope: scope
		}).onConflictDoUpdate({
			target: sessions.shop,
			set: {
				accessToken: access_token,
				scope: scope,
				updatedAt: new Date()
			}
		})


		return redirect("/")

	}
}

export default function AuthFinal() {
	return <></>
}