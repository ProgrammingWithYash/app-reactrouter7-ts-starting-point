import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("settings", "routes/settings.tsx"),
	route("api/settings", "routes/api.settings.ts"),
	// Where a page loaded without a session token goes to get one.
	route("session-token", "routes/session-token.ts"),
] satisfies RouteConfig;
