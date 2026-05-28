# Railway Deployment (Docker Compose Stack)

Deploy **app + Postgres + Redis** as containers on Railway — without Railway managed databases.

Railway does not run `docker-compose.yml` as a single process. Each service in compose becomes a **separate Railway service** in one project. This repo includes `docker-compose.railway.yml` as the production template.

---

## Architecture

| Service  | Type              | Public access |
|----------|-------------------|---------------|
| `app`    | Dockerfile build  | Yes (domain)  |
| `postgres` | `postgres:16` | No (private) |
| `redis`  | `redis:7-alpine`  | No (private)  |

Services communicate over Railway private network:

- Postgres: `postgres.railway.internal:5432`
- Redis: `redis.railway.internal:6379`

---

## Option A — Import compose file (fastest)

1. Create **Empty project** in Railway.
2. Drag & drop `docker-compose.railway.yml` into the project.
3. Railway creates 3 services: `postgres`, `redis`, `app`.
4. Connect **GitHub repo** to the `app` service (Settings → Source).
5. For `postgres` service → attach a **Volume** (see section below).
6. For `app` service → Settings → Networking → **Generate Domain**.
7. Set secrets in **app** Variables (see below).
8. Migrate local data if needed (see **Migrate local DB to Railway** section).

> If `app` fails to build after import, connect the GitHub repo and redeploy.

---

## Option B — Create services manually

### 1) Postgres

- **+ New → Docker Image** → `postgres:16` (not `-alpine` — alpine fails with `locale: not found` on Railway)
- Rename service to **`postgres`** (exact name)
- Variables:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=mydatabase
PGDATA=/var/lib/postgresql/mount/data
```

- Settings → attach a **Volume** (see section below)

### 2) Redis

- **+ New → Docker Image** → `redis:7-alpine`
- Rename service to **`redis`**

### 3) App (backend)

- **+ New → GitHub Repo** → this repository
- Rename service to **`app`**
- Railway detects `Dockerfile` and `railway.json` automatically
- Settings → Networking → **Generate Domain**
- Variables:

```env
NODE_ENV=production
JWT_SECRET=<long-random-secret>

DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_USERNAME=myuser
DB_PASSWORD=<same-as-postgres>
DB_DATABASE=mydatabase
DB_SYNCHRONIZE=true
DB_SSL=false

REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=

ENABLE_SWAGGER=true
BASE_URL=https://<your-app-domain>
```

---

## Attach Volume to Postgres on Railway

In Railway, volumes are **not** always visible under service Settings. Use one of these ways:

### Way 1 — Command Palette (recommended)

1. Open your Railway project (canvas view).
2. Press **`Ctrl+K`** (Windows/Linux) or **`Cmd+K`** (Mac).
3. Type **Volume** → choose **Create Volume** / **Add Volume**.
4. Select service **`postgres`**.
5. Set mount path: **`/var/lib/postgresql/mount`** (not `/var/lib/postgresql/data`)
6. On **postgres** service Variables add: **`PGDATA=/var/lib/postgresql/mount/data`**
7. Redeploy the `postgres` service.

> **Why not `/var/lib/postgresql/data`?** Railway volume root contains `lost+found`. Postgres refuses to init directly on a mount point. Data must live in a subdirectory — set via `PGDATA`.

### Way 2 — Right-click on canvas

1. Right-click empty area on project canvas.
2. Choose volume creation option.
3. Attach to service `postgres` with mount path **`/var/lib/postgresql/mount`**
4. Add variable `PGDATA=/var/lib/postgresql/mount/data` on postgres service.

### Way 3 — CLI

```bash
railway login
railway link
railway volume add --mount-path /var/lib/postgresql/mount
```

Then attach it to the `postgres` service when prompted and set `PGDATA=/var/lib/postgresql/mount/data`.

### Important

- Do **not** manually create `RAILWAY_VOLUME_MOUNT_PATH` variable — Railway sets it automatically.
- Only **one** volume per postgres service.
- Volume appears only at **runtime**, not during build.
- If postgres already failed with `lost+found` error: delete the broken volume, create a new one at `/var/lib/postgresql/mount`, set `PGDATA`, redeploy.

---

## Migrate local DB to Railway

Goal: copy all tables/data from local Docker Postgres to remote Railway Postgres.

### Step 1 — Export local database

From project root (local stack must be running):

```powershell
.\scripts\backup-local-db.ps1
```

Or manually:

```powershell
docker compose exec -T postgres pg_dump -U myuser -d mydatabase --clean --if-exists --no-owner --no-acl > backup.sql
```

Default credentials from `docker-compose.yml`:
- user: `myuser`
- database: `mydatabase`

### Step 2 — Open temporary access to Railway Postgres

Railway Postgres is private by default. For one-time import enable **TCP Proxy**:

1. Open service **`postgres`** on Railway.
2. **Settings → Networking → TCP Proxy** → Enable (port `5432`).
3. Copy proxy host + port (example: `monorail.proxy.rlwy.net:12345`).

Build connection string:

```text
postgresql://myuser:<POSTGRES_PASSWORD>@<TCP_PROXY_HOST>:<TCP_PROXY_PORT>/mydatabase
```

Use the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` that you set in Railway postgres variables.

### Step 3 — Restore dump to Railway

```powershell
.\scripts\restore-to-railway.ps1 `
  -BackupFile "backup-mydatabase-2026-05-28-120000.sql" `
  -RemoteUrl "postgresql://myuser:<password>@<host>:<port>/mydatabase"
```

Or manually:

```powershell
Get-Content backup.sql -Raw | docker run -i --rm postgres:16-alpine psql "postgresql://myuser:<password>@<host>:<port>/mydatabase"
```

### Step 4 — Verify

1. Check restore output — should end without fatal errors.
2. Redeploy `app` service.
3. Open API and verify products/categories/users exist.
4. **Disable TCP Proxy** on postgres after migration (security).

### Alternative — Railway CLI

If CLI is linked to project:

```bash
railway connect postgres
```

This opens interactive `psql`. For bulk restore, TCP Proxy + `psql < backup.sql` is easier.

### Notes

- Run migration when remote postgres is **empty** (first deploy) or use `--clean` dump carefully on production.
- If remote DB already has schema from `DB_SYNCHRONIZE=true`, restore still works with `--clean --if-exists` dump.
- Redis data usually does not need migration (queues/cache). Only Postgres tables are migrated.

---

## Troubleshooting

### `initdb: directory exists but is not empty` / `lost+found`

Postgres volume is mounted at `/var/lib/postgresql/data` — wrong for Railway.

**Fix:**

1. Remove old volume from postgres service (or create new volume).
2. Mount path: **`/var/lib/postgresql/mount`**
3. Variable on postgres: **`PGDATA=/var/lib/postgresql/mount/data`**
4. Redeploy postgres — logs should show `database system is ready to accept connections`.

### `sh: locale: not found` during initdb

You are using **`postgres:16-alpine`**. Alpine has no locales and initdb fails on Railway.

**Fix:**

1. Open service **`postgres`** → change Docker image from `postgres:16-alpine` to **`postgres:16`**
2. Keep volume mount `/var/lib/postgresql/mount` and `PGDATA=/var/lib/postgresql/mount/data`
3. Redeploy postgres

### `ETIMEDOUT` / `Unable to connect to the database`

Log shows connection timeout → app cannot reach Postgres (often because postgres is in crash loop — fix volume first).

**Checklist:**

1. Postgres service is named exactly **`postgres`** (Settings → rename if needed).
2. Postgres logs show **ready to accept connections** (not initdb errors).
3. On **app** service Variables:
   - `DB_HOST=postgres` (auto becomes `postgres.railway.internal` with latest code)
   - `DB_PORT=5432`
   - `DB_PASSWORD` matches `POSTGRES_PASSWORD` on postgres service
4. Redeploy **app** after postgres is healthy.

Same for Redis: `REDIS_HOST=redis` (auto-resolves on Railway).

---

## Verify deployment

1. Open app logs — should show successful Postgres connection.
2. Open public domain — `GET /` should return a response.
3. If Swagger enabled: `https://<domain>/api-docs`

Health endpoint: `GET /`

---

## Local development (same stack)

```bash
cp .env.example .env
docker compose up --build
```

API: `http://localhost:3000`

---

## Important notes

- **`depends_on` is ignored on Railway.** TypeORM already retries DB connection (`retryAttempts: 10`). If app crashes on first deploy, redeploy once Postgres is healthy.
- **Service names matter.** Use exactly `postgres`, `redis`, `app` so private DNS works.
- On Railway you can set `DB_HOST=postgres` and `REDIS_HOST=redis` — app auto-resolves to `*.railway.internal`.
- **Only `app` needs a public domain.** Do not expose Postgres/Redis publicly.
- After the first successful deploy, set `DB_SYNCHRONIZE=false` on the app service for safer production operation.
- Change default passwords (`DB_PASSWORD`, `JWT_SECRET`) before going live.

---

## Files in this repo

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local dev stack |
| `docker-compose.railway.yml` | Railway import template |
| `Dockerfile` | App container build |
| `railway.json` | Railway build config (Dockerfile builder) |
| `.env.example` | Environment variable reference |
