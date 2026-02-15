import { createCookie } from "react-router";

export const authStateCookie = createCookie("oauth-state", {
	httpOnly: true,
	secure: true,
	sameSite: "lax",
	maxAge: 60*5,
	secrets: [process.env.FLICKSELL_COOKIE_SECRET!]
});