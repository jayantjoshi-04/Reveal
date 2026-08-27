# Deploying REVEAL 2.0

Three pieces: **Neon** (Postgres) · **Render** (API, `apps/api`) · **Vercel** (web, `apps/web`).
Everything below is $0-tier friendly.

---

## 1 · Database — Neon

1. Create a project at [neon.tech] → copy the **connection string** (it looks like
   `postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
2. That string is your `DATABASE_URL` everywhere below.

The schema is created for you on first deploy by `db:deploy` (see §2) — it runs the
raw-SQL auth migrations, pushes the v2 Prisma schema, and seeds the master data.

You can also do it once from your machine:

```bash
DATABASE_URL="postgres://…neon…?sslmode=require" pnpm db:deploy
```

`db:deploy` is idempotent — safe to run on every deploy.

---

## 2 · API — Render

The repo ships a **`render.yaml` blueprint**. In Render → **New → Blueprint**, point it
at this repo. It configures:

- **Build:** install → build `@reveal/shared` → `prisma generate` → compile the API.
- **Pre-deploy:** `pnpm --filter @reveal/api db:deploy` (migrate + push v2 schema + seed).
- **Start:** `pnpm --filter @reveal/api start` → `node dist/server.js`.
- **Health check:** `/health`.

Set these env vars (Render → Environment):

| Key | Value |
|---|---|
| `DATABASE_URL` | your Neon string (§1) |
| `JWT_SECRET` | a long random string (Render can generate it) |
| `CORS_ORIGIN` | your Vercel URL, e.g. `https://reveal.vercel.app` |
| `APP_URL` | same Vercel URL (used in verification emails) |
| `BREVO_API_KEY` | *(optional)* email transport; unset = codes logged to console |

`NODE_ENV=production` is set by the blueprint. Render injects `PORT` automatically.

> No blueprint? Create a **Web Service** manually with the same build / pre-deploy /
> start commands from `render.yaml`.

---

## 3 · Web — Vercel

The repo ships **`vercel.json`**. In Vercel → **New Project** → import this repo:

- Build and output are already set (`vercel.json`): it builds `@reveal/shared` then `apps/web`.
- Add one env var: **`VITE_API_URL`** = your Render API URL, e.g. `https://reveal-api.onrender.com`.
- Deploy. SPA rewrites are already configured.

---

## 4 · First admin account

Admins aren't self-serve. Create the first `staff` row directly in Neon (SQL editor),
then sign in at `/admin/signin`. Students self-register at `/signup`, or an admin
provisions them from the Students tab.

---

## 5 · Checklist

- [ ] Neon project created, `DATABASE_URL` copied
- [ ] Render service up, env vars set, first deploy green (watch pre-deploy logs for
      `✅ v2 seed complete`)
- [ ] `GET https://<api>/health` returns `{"status":"ok"}`
- [ ] Vercel project up with `VITE_API_URL` pointing at Render
- [ ] Sign up a test student → run the studio session → report generates
