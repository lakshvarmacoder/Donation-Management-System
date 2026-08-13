# Run the system locally

By the end of this tutorial you will have the backend API and frontend running on your machine, connected to Supabase, with a seeded campaign you can donate to.

## Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project (free tier is fine)
- A Razorpay test account (optional — the system has a demo fallback)

---

## 1. Clone and enter the project

```bash
git clone <repo-url>
cd "Donation Management System"
```

---

## 2. Set up the database

Open your Supabase project → SQL Editor → paste the entire contents of `supabase/schema.sql` → click **Run**.

This creates all tables, views, triggers, and RLS policies in one shot.

Expected result: no errors, tables visible in the Table Editor.

---

## 3. Configure the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
```

Copy the example env file and fill in your values:

```bash
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
```

Open `backend/.env` and set at minimum:

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/postgres
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> Find these values in your Supabase dashboard under **Project Settings → API**.

---

## 4. Start the backend

```bash
cd backend
uvicorn app.main:app --reload
```

Expected result:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Verify it works:

```bash
curl http://localhost:8000/health
```

```json
{ "status": "ok", "app": "Donation Management System", "version": "1.0.0" }
```

---

## 5. Configure the frontend

```bash
cd frontend
npm install
```

Open `frontend/.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
```

> `NEXT_PUBLIC_BACKEND_URL` is used by the admin dashboard client. `BACKEND_URL` is used server-side by the Next.js donation API route. Both default to `http://localhost:8000` if not set.

---

## 6. Start the frontend

```bash
cd frontend
npm run dev
```

Expected result:

```text
▲ Next.js 16.3.0
- Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the campaign page with the seeded "Back to School 2026" campaign.

---

## 7. Bootstrap the first admin

The database schema seeds a campaign but not an admin user. You need to create one manually.

→ Follow [How to bootstrap the first admin](../how-to/bootstrap-admin.md).

---

## 8. Open the admin dashboard

Go to [http://localhost:3000/dms](http://localhost:3000/dms).

The dashboard has four tabs: Overview, Donations, Campaigns, and Donors.

> `/admin` redirects to `/dms` automatically.

---

## Next steps

- [How to create a campaign](../how-to/create-a-campaign.md)
- [How to record an offline donation](../how-to/record-offline-donation.md)
- [Architecture overview](../explanation/architecture.md)
