import { redirect } from "react-router"
import type { Route } from "../../+types/root"
import { authStateCookie } from "~/cookies.server"
import { FlicksellSDK } from "@flicksell/sdk"

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	
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

	if (!verification.shop) {
		throw new Response("Missing shop parameter", { status: 400 });
	}

	// Initiate OAuth flow
	const { authUrl, nonce } = sdk.initiateOAuth(verification.shop)

	return redirect(authUrl, {
		headers: {
			"Set-Cookie": await authStateCookie.serialize(nonce)
		}
	})
}

export default function AuthInitial() {
	return <></>
}