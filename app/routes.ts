import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("auth/initial", "routes/auth/auth-initial.tsx")
	route("auth/final", "routes/auth/auth-final.tsx")
] satisfies RouteConfig;
