import { redirect } from "react-router"
import type { Route } from "../../+types/root"
import { authStateCookie } from "~/cookies.server"
import { db } from "~/db"
import { sessions } from "~/db/schema/schema"
import { FlicksellSDK } from "@flicksell/sdk"

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const urlParams = url.searchParams.get

	// Verify state/nonce
	const nonce = await authStateCookie.parse(request.headers.get("Cookie"))
	const nonceFromQuery = urlParams("state")
	if (nonce !== nonceFromQuery) {
		throw new Response("Invalid State", { status: 403 });
	}

	// Initialize SDK
	const sdk = new FlicksellSDK({
		apiKey: process.env.FLICKSELL_API_KEY!,
		apiSecret: process.env.FLICKSELL_API_SECRET!,
		flicksellUrl: process.env.FLICKSELL_URL!
	})

	// Verify HMAC signature
	const verification = sdk.verifyHmac(url.searchParams)
	
	if (!verification.isValid) {
		throw new Response("Invalid HMAC", { status: 403 });
	}

	const shop = urlParams("shop");
	const code = urlParams("code");

	if (!shop || !code) {
		throw new Response("Missing required parameters", { status: 400 });
	}

	// Exchange code for access token
	const result = await sdk.completeOAuth(code, shop)

	// Save to database
	await db.insert(sessions).values({
		shop: result.shop,
		accessToken: result.accessToken,
		scope: result.scope,
		isOnline: false
	}).onConflictDoUpdate({
		target: sessions.shop,
		set: {
			accessToken: result.accessToken,
			scope: result.scope,
			updatedAt: new Date()
		}
	})

	return redirect("/")
}

export default function AuthFinal() {
	return <></>
}