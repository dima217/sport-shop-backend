# Railway Deployment (Docker Compose Stack)

Deploy **app + Postgres + Redis** as containers on Railway — without Railway managed databases.

Railway does not run `docker-compose.yml` as a single process. Each service in compose becomes a **separate Railway service** in one project. This repo includes `docker-compose.railway.yml` as the production template.

---

## Architecture

| Service  | Type              | Public access |
|----------|-------------------|---------------|
| `app`    | Dockerfile build  | Yes (domain)  |
| `postgres` | `postgres:16-alpine` | No (private) |
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
5. For `postgres` service → Settings → Volumes → Add Volume:
   - Mount path: `/var/lib/postgresql/data`
6. For `app` service → Settings → Networking → **Generate Domain**.
7. Set secrets in **app** Variables (see below).

> If `app` fails to build after import, connect the GitHub repo and redeploy.

---

## Option B — Create services manually

### 1) Postgres

- **+ New → Docker Image** → `postgres:16-alpine`
- Rename service to **`postgres`** (exact name)
- Variables:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=mydatabase
```

- Settings → Volumes → mount `/var/lib/postgresql/data`

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
