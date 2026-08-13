# Database schema

All tables live in the `public` schema in PostgreSQL (Supabase). Row-level security (RLS) is enabled on every table.

---

## Enums

| Enum | Values |
|---|---|
| `profile_role` | `admin` |
| `campaign_status` | `draft`, `active`, `archived` |
| `donation_source` | `online`, `offline` |
| `donation_status` | `pending`, `completed`, `failed`, `refunded` |

---

## Tables

### profiles

Stores admin user records. Linked 1-to-1 with Supabase Auth users.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | — | FK → `auth.users(id)`, cascades on delete |
| `full_name` | text | No | — | 2–120 characters |
| `role` | profile_role | No | `admin` | Only `admin` exists in Phase 1 |
| `created_at` | timestamptz | No | `now()` | — |

**RLS policies**
- A user can `SELECT` their own row (`id = auth.uid()`)
- Admins can do everything (`is_admin()`)

---

### campaigns

Fundraising campaigns that donations are linked to.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `slug` | text | No | — | Unique, URL-safe: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `title` | text | No | — | 3–160 characters |
| `description` | text | No | — | — |
| `image_url` | text | Yes | — | — |
| `goal_amount` | numeric(12,2) | No | — | Must be > 0 |
| `start_date` | date | No | `current_date` | — |
| `end_date` | date | Yes | — | Must be ≥ `start_date` if set |
| `status` | campaign_status | No | `draft` | — |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | Auto-updated by trigger |

**Trigger:** `campaigns_set_updated_at` — sets `updated_at = now()` before every update.

**RLS policies**
- Anyone can `SELECT` campaigns where `status = 'active'`
- Admins can do everything

---

### donations

Individual donation records for both online and offline sources.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `campaign_id` | uuid | No | — | FK → `campaigns(id)`, restricted on delete |
| `donor_name` | text | No | — | 2–120 characters |
| `donor_email` | text | No | — | Validated by regex |
| `donor_phone` | text | Yes | — | — |
| `amount` | numeric(12,2) | No | — | Must be > 0 |
| `currency` | text | No | `INR` | Only `INR` accepted |
| `source` | donation_source | No | — | `online` or `offline` |
| `payment_method` | text | Yes | — | e.g. `razorpay`, `offline_cash` |
| `gateway_order_id` | text | Yes | — | Unique, Razorpay order ID |
| `gateway_payment_id` | text | Yes | — | Unique, Razorpay payment ID |
| `status` | donation_status | No | `pending` | — |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | Auto-updated by trigger |

**Trigger:** `donations_set_updated_at` — sets `updated_at = now()` before every update.

**Trigger:** `donations_issue_receipt` — fires after insert or status update. When `status` becomes `completed`, inserts a row into `receipts` automatically.

**Indexes**
- `(campaign_id, created_at DESC)` — campaign donation listing
- `(lower(donor_email))` — donor lookup
- `(status, created_at DESC)` — status-filtered listing

**RLS policies**
- Admins can do everything
- `anon` and `authenticated` roles have all permissions revoked

---

### receipts

Auto-generated receipt records. One receipt per completed donation.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | No | `gen_random_uuid()` | Primary key |
| `donation_id` | uuid | No | — | Unique FK → `donations(id)`, cascades on delete |
| `receipt_number` | text | No | — | Unique, format: `SF-YYYYMMDD-XXXXXXXX` |
| `pdf_url` | text | Yes | — | Not yet implemented in Phase 1 |
| `issued_at` | timestamptz | No | `now()` | — |

**RLS policies**
- Admins can do everything

---

## Views

### campaign_summaries

Joins `campaigns` with aggregated donation totals.

| Column | Source |
|---|---|
| All campaign columns | `campaigns` |
| `amount_raised` | `SUM(donations.amount)` where `status = 'completed'` |

---

### donor_summaries

Aggregates donation history per donor email.

| Column | Description |
|---|---|
| `donor_email` | Lowercased email (group key) |
| `donor_name` | Most recent name for this email |
| `donor_phone` | Most recent phone for this email |
| `completed_donations` | Count of completed donations |
| `total_donated` | Sum of completed donation amounts |
| `last_donated_at` | Timestamp of most recent completed donation |

---

## Functions

### is_admin()

```sql
select public.is_admin();
```

Returns `true` if the currently authenticated user has `role = 'admin'` in `profiles`. Used by all admin RLS policies.

### set_updated_at()

Trigger function. Sets `updated_at = now()` on the row being updated. Used by `campaigns` and `donations`.

### issue_receipt_for_completed_donation()

Trigger function. Runs `AFTER INSERT OR UPDATE OF status` on `donations`. When `status` transitions to `completed`, inserts a receipt with number format `SF-YYYYMMDD-XXXXXXXX`. Uses `ON CONFLICT DO NOTHING` so re-running is safe.

---

## Related

- [How to bootstrap the first admin](../how-to/bootstrap-admin.md)
- [Payment flow — receipt generation](../explanation/payment-flow.md#receipt-generation)
