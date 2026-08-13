# How to bootstrap the first admin

Create the first admin user so you can access the admin dashboard.

## Before you start

- The database schema must already be applied (`supabase/schema.sql`)
- You need access to your Supabase project dashboard

---

## Steps

### 1. Create the user in Supabase Auth

1. Go to your Supabase dashboard → **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter an email and password
4. Copy the generated **User UID** (you'll need it in the next step)

### 2. Insert the admin profile

Go to **SQL Editor** and run:

```sql
insert into public.profiles (id, full_name, role)
values ('<paste-user-uid-here>', 'Your Name', 'admin');
```

Replace `<paste-user-uid-here>` with the UID from step 1.

### 3. Sign in

Go to [http://localhost:3000/dms](http://localhost:3000/dms) and sign in with the email and password you created.

> `/admin` redirects to `/dms` automatically.

---

## Verify

After signing in, the admin dashboard loads without a 401 or redirect. You can see the donations table and platform stats.

---

## Troubleshooting

### "row violates row-level security policy"

The `profiles` table has RLS enabled. The insert above must be run in the Supabase SQL Editor (which runs as the service role and bypasses RLS), not from the application.

### "User not found"

Make sure you copied the UID from **Authentication → Users**, not from the profiles table (which is empty at this point).

---

## Related

- [API reference — authentication](../reference/api.md#authentication)
- [Architecture — admin flow](../explanation/architecture.md#admin-flow)
