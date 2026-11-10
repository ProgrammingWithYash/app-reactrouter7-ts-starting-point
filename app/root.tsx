import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { flicksell as server } from "./flicksell.server";

// The client id and the bridge's address are public; the secret never leaves the server.
export function loader() {
  return { apiKey: server.apiKey, appBridgeUrl: server.appBridgeUrl };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {data && <meta name="flicksell-api-key" content={data.apiKey} />}
        {/* First, before anything fetches: from here on every request to this
            app's backend carries a session token. */}
        {data && <script src={data.appBridgeUrl} />}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();
  const busy = useNavigation().state !== "idle";

  // Admin's loading bar, for as long as any page of the app is waiting on the server.
  useEffect(() => {
    flicksell.loading(busy);
  }, [busy]);

  useEffect(() => {
    // The app's pages, listed under it in admin's sidebar.
    flicksell.nav.set([
      { label: "Todos", path: "/" },
      { label: "Settings", path: "/settings" },
    ]);

    // Someone chose one of them there: move without reloading the frame.
    const onNavigate = (event: Event) => {
      event.preventDefault();
      navigate((event as CustomEvent<{ path: string }>).detail.path);
    };
    addEventListener("flicksell:navigate", onNavigate);
    return () => removeEventListener("flicksell:navigate", onNavigate);
  }, [navigate]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.status === 401
          ? "Open this app from Apps in your Flicksell admin."
          : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
