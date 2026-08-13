# Architecture overview

## What the system does

The Donation Management System lets Saanjh Foundation run fundraising campaigns, accept online and offline donations, auto-generate receipts, and view a live admin dashboard — all from a single local deployment.

---

## Components

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│   Public pages (/, /donate)   Admin (/dms)          │
│   (Next.js / React)           (Next.js / React)     │
└──────────────┬──────────────────┬───────────────────┘
               │                  │
               │ POST /api/donations   lib/api-client.ts
               │ (Next.js Route Handler)  (direct fetch)
               ▼                  ▼
┌─────────────────────────────────────────────────────┐
│                  FastAPI backend                    │
│                                                     │
│   /api/v1/campaigns  (GET, POST, PUT, DELETE)       │
│   /api/v1/donations  (GET, POST, verify, DELETE)    │
│   /api/v1/webhooks/razorpay                         │
└──────────────────────────┬──────────────────────────┘
                           │ asyncpg
                           ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL (Supabase)                  │
│                                                     │
│   campaigns   donations   receipts   profiles       │
│                                                     │
│   RLS policies   Triggers   Views                   │
└─────────────────────────────────────────────────────┘
                           ▲
                           │ Webhooks (HTTPS)
┌──────────────────────────┴──────────────────────────┐
│                   Razorpay                          │
└─────────────────────────────────────────────────────┘
```

> There is also a second webhook handler at `POST /api/payments/razorpay/webhook` (Next.js Route Handler) that writes directly to Supabase. This is a fallback for deployments where only the frontend is running.

---

## Donor flow

```
Donor opens /donate
  → Fills donation form
  → POST /api/donations  (Next.js Route Handler)
      → Validates request
      → Calls FastAPI POST /api/v1/donations
          → Pending donation row created in DB
          → Razorpay order created
      → If FastAPI is unreachable, falls back to direct
        Razorpay order creation (lib/donations/service.ts)
  → Razorpay checkout modal opens in browser
  → Donor completes payment
  → Frontend calls POST /api/v1/donations/verify
      → Signature verified (auto-passes for demo orders)
      → Donation status updated to "completed"
      → DB trigger fires → receipt row created
  → Razorpay also sends webhook to FastAPI (or Next.js handler)
    as a secondary confirmation
```

---

## Admin flow

```
Admin opens /dms  (/admin redirects here automatically)
  → lib/api-client.ts fetches all campaigns, donations, stats from FastAPI
  → Dashboard renders four tabs: Overview, Donations, Campaigns, Donors

  Campaigns tab:
  → Create campaign via New Campaign modal
      → POST /api/v1/campaigns
  → Edit campaign via Edit Campaign modal
      → PUT /api/v1/campaigns/{id}
  → Pause / Activate campaign
      → PUT /api/v1/campaigns/{id}  { status: "draft" | "active" }
  → Archive campaign
      → DELETE /api/v1/campaigns/{id}  (soft-delete, sets status = archived)

  Donations tab:
  → Search donations by donor name, email, or campaign
  → Delete erroneous donation record
      → DELETE /api/v1/donations/{id}

  Overview tab:
  → Export all donations as CSV via Export report button
```

---

## Key design decisions

### The Next.js API route is a deliberate intermediary for donations

The donate page does not call FastAPI directly. It calls the Next.js Route Handler at `/api/donations`, which then calls FastAPI. This keeps `RAZORPAY_KEY_SECRET` server-side only and enables a resilience fallback: if FastAPI is unreachable, `lib/donations/service.ts` creates the Razorpay order directly. The browser never sees the secret.

### Payment verification is explicit, not just webhook-driven

After the donor completes checkout, the frontend calls `POST /api/v1/donations/verify` with the Razorpay signature. This marks the donation `completed` immediately, giving the donor instant feedback. The webhook from Razorpay serves as a secondary confirmation. For demo orders (`order_demo_*`), signature verification is skipped automatically.

### The admin dashboard uses a separate API client

`lib/api-client.ts` handles all admin data fetching and mutations (campaigns, donations, stats). It reads from `NEXT_PUBLIC_BACKEND_URL` and runs in client components. This is entirely separate from the donation flow, which goes through the Next.js Route Handler.

### FastAPI owns all business logic

All mutations go through the FastAPI backend. This keeps business rules (validation, status transitions, receipt generation) in one place and makes the frontend replaceable.

### Campaign deletion is a soft-delete

`DELETE /api/v1/campaigns/{id}` sets `status = archived` rather than removing the row. This preserves the donation records linked to the campaign and keeps historical data intact.

### Receipts are generated by a database trigger

When a donation's `status` transitions to `completed`, the PostgreSQL trigger `donations_issue_receipt` fires and inserts a receipt row. Receipt creation is atomic with the status update and cannot be skipped by a bug in application code.

### RLS as a safety net, not the primary auth layer

Row-level security is enabled on all tables. The `is_admin()` function checks `profiles.role`. This prevents accidental data exposure if a query bypasses the API, but the primary auth check is the `X-API-Key` header on admin API routes.

---

## What is not in Phase 1

- Email delivery (receipt emails are logged to console only)
- PDF generation for receipts
- Multi-org support
- Real-time dashboard updates (polling only)
- Docker packaging

---

## Related

- [Payment and donation flow](payment-flow.md)
- [Database schema](../reference/database-schema.md)
- [Environment variables](../reference/environment-variables.md)
