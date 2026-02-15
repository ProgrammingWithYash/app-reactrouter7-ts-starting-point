import { createCookie } from "react-router";
import crypto from "crypto";

const COOKIE_SECRET = crypto.randomBytes(32).toString("hex");

export const authStateCookie = createCookie("oauth-state", {
	httpOnly: true,
	secure: true,
	sameSite: "lax",
	maxAge: 60*5,
	secrets: [COOKIE_SECRET]
});