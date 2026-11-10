# Flicksell app starter

A React Router app that runs inside Flicksell admin.

## Run it

```
flicksell app dev
```

That starts the dev server, tunnels Flicksell to it, and installs the app on the
store you pick. Open the app from **Apps** in that store's admin.

## How it works

- `flicksell.app.toml` — the app's identity and the scopes it asks for.
- `flicksell.web.toml` — how to run it locally.
- `app/flicksell.server.ts` — the one place Flicksell is configured.
- `app/routes/home.tsx` — authenticates the request and calls the Admin API.
- `app/db/` — where access tokens are kept (SQLite by default; set `DB_URL` for another database).

Every request from admin carries a session token. `flicksell.authenticate.admin(request)`
checks it and gives you an Admin API client:

```ts
const { admin, session } = await flicksell.authenticate.admin(request);
const { data } = await admin.graphql(`{ products(first: 10) { nodes { id title } } }`);
```

For work with nobody looking at the app (a scheduled job, a webhook):

```ts
const offline = await flicksell.offline("store-name.myflicksell.com");
```

## Publish

```
flicksell app deploy
```
