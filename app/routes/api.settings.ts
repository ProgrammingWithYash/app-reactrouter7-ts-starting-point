import type { Route } from "./+types/api.settings";
import { flicksell } from "~/flicksell.server";
import { saveSettings } from "~/db/store.server";

// Called with plain fetch from the settings page. The bridge adds the session
// token to it, so this authenticates exactly like a page does.
export async function action({ request }: Route.ActionArgs) {
	const { session } = await flicksell.authenticate.admin(request);
	const body = await request.json() as { listName?: unknown; hideDone?: unknown };

	const listName = typeof body.listName === "string" ? body.listName.trim() : "";
	if (!listName) return Response.json({ success: false, message: "The list needs a name." }, { status: 400 });

	await saveSettings(session.shop, { listName, hideDone: body.hideDone === true });
	return Response.json({ success: true });
}
