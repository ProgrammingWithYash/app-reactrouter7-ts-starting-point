import crypto from "crypto"
import { createCookieSessionStorage, redirect } from "react-router"
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

	const computed = crypto
		.createHmac("sha256", process.env.API_SECRET as string)
		.update(sorted)
		.digest("hex")

	const nonce = crypto.randomUUID()

	const inputBuffer = Buffer.from(computed, 'hex');
	const storedBuffer = Buffer.from(hmac, 'hex');

	if (crypto.timingSafeEqual(inputBuffer, storedBuffer)) {
		return redirect((process.env.AUTH_REDIRECT_URL as string) + "/" + urlParams("shop") + "?client_id=" + process.env.API_KEY + "&scope=" + urlParams("scope") + "&state=" + nonce, {
			headers: {
				"Set-cookie": await authStateCookie.serialize(nonce)
			}
		})
	}
}

export default function AuthInitial() {
	return <></>
}