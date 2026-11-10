import { ApiVersion, flicksellApp } from "@flicksell/api";
import { sessionStorage } from "./db/session-storage.server";

function required(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set. Start the app with: flicksell app dev`);
	return value;
}

/**
 * This app's connection to Flicksell. `flicksell app dev` supplies the three
 * variables; in production, set them where the app is hosted.
 *
 *   const { admin, session } = await flicksell.authenticate.admin(request);
 */
export const flicksell = flicksellApp({
	apiKey: required("FLICKSELL_API_KEY"),
	apiSecretKey: required("FLICKSELL_API_SECRET"),
	apiUrl: required("FLICKSELL_API_URL"),
	apiVersion: ApiVersion.July25,
	sessionStorage,
	// Set to true to act as the person using the app rather than as the app itself.
	useOnlineTokens: false,
});

/** The app's client id. Safe to send to the browser; the secret never is. */
export const apiKey = flicksell.apiKey;
