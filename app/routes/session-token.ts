import type { Route } from "./+types/session-token";
import { flicksell } from "~/flicksell.server";

// Reloading a page inside admin, or opening a link to one, gives the request
// no way to carry a session token. authenticate.admin sends such a request
// here; this page gets a token from admin and goes back with it.
export function loader({ request }: Route.LoaderArgs) {
	return flicksell.sessionTokenPage(request);
}
