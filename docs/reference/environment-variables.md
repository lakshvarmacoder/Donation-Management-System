# Environment variables

## Backend — `backend/.env`

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Async connection string. Format: `postgresql+asyncpg://<user>:<password>@<host>:5432/<dbname>` |
| `USER` | No | DB username. Used only if `DATABASE_URL` is not set. Default: `postgres` |
| `PASSWORD` | No | DB password. Used only if `DATABASE_URL` is not set |
| `HOST` | No | DB host. Default: `localhost` |
| `PORT` | No | DB port. Default: `5432` |
| `DBNAME` | No | Database name. Default: `postgres` |

`DATABASE_URL` takes precedence. If it is set and does not contain `YOUR_PROJECT_REF`, the individual `USER`/`PASSWORD`/`HOST`/`PORT`/`DBNAME` variables are ignored.

---

### Supabase

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Your project URL. Format: `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Public anon key from **Project Settings → API** |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key. Used as the admin `X-API-Key`. Keep this secret. |

---

### Razorpay

| Variable | Required | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | No | Key ID from Razorpay dashboard. If absent, demo mode is used. |
| `RAZORPAY_KEY_SECRET` | No | Key secret. Also accepted as `X-API-Key` for admin endpoints. |
| `RAZORPAY_WEBHOOK_SECRET` | No | Webhook secret for HMAC signature verification. Falls back to `RAZORPAY_KEY_SECRET` if not set. |

---

### App

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_NAME` | No | `Donation Management System` | Shown in health check and API docs title |
| `DEBUG` | No | `true` | Set to `false` in production |
| `CORS_ORIGINS` | No | `["*"]` | JSON list of allowed origins. Restrict in production. |

---

## Frontend — `frontend/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key. Used server-side for admin Supabase operations. Keep secret. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | No | Razorpay publishable key ID. Embedded in the browser bundle for the checkout modal. |
| `RAZORPAY_KEY_SECRET` | No | Razorpay secret key. Server-side only — used by `lib/payments/razorpay.ts` to create orders directly when the FastAPI backend is unavailable. Never expose this to the browser. |
| `RAZORPAY_WEBHOOK_SECRET` | No | Webhook signature secret for verifying Razorpay events. |
| `NEXT_PUBLIC_BACKEND_URL` | No | FastAPI backend base URL. Default: `http://localhost:8000`. Used by `lib/api-client.ts` for admin dashboard data fetching. |
| `BACKEND_URL` | No | Server-side FastAPI URL used by `lib/donations/service.ts` (the Next.js API route layer). Default: `http://localhost:8000`. |

`NEXT_PUBLIC_*` variables are embedded in the browser bundle at build time. Never put secrets in them.

`RAZORPAY_KEY_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are server-side only — they are used in Next.js Route Handlers and Server Components, never in client components.

---

## Example files

`backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/postgres
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RAZORPAY_KEY_ID=rzp_test_<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
```

---

## Related

- [Tutorial: Run the system locally](../tutorials/getting-started.md)
- [How to configure Razorpay](../how-to/configure-razorpay.md)
