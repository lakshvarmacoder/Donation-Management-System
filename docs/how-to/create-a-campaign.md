# How to create a campaign

Add a new fundraising campaign that donors can give to. You can do this from the admin dashboard UI or via the API directly.

## Before you start

- Backend is running at `http://localhost:8000`
- You are signed in to the admin dashboard at [http://localhost:3000/dms](http://localhost:3000/dms)

---

## Option A: Admin dashboard (recommended)

### 1. Open the Campaigns tab

Go to [http://localhost:3000/dms](http://localhost:3000/dms) and click the **Campaigns** tab.

### 2. Open the new campaign modal

Click **New campaign** in the top-right corner.

### 3. Fill in the form

| Field | Required | Notes |
|---|---|---|
| Campaign title | Yes | 3–160 characters |
| URL slug | Yes | Auto-generated from the title. Editable. Lowercase, hyphens only. |
| Description | Yes | Shown on the public campaign page |
| Goal amount (₹) | Yes | Minimum ₹100 |

Click **Create Campaign**.

---

## Option B: API directly

```bash
curl -X POST http://localhost:8000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-service-role-key>" \
  -d '{
    "title": "Winter Blanket Drive 2026",
    "slug": "winter-blankets-2026",
    "description": "Distribute warm blankets to 500 families before December.",
    "goal_amount": 75000,
    "start_date": "2026-10-01",
    "end_date": "2026-12-31",
    "status": "active"
  }'
```

**Response — 201**

```json
{
  "id": "a1b2c3d4-...",
  "slug": "winter-blankets-2026",
  "title": "Winter Blanket Drive 2026",
  "status": "active",
  "goal_amount": 75000.0,
  "amount_raised": 0.0,
  "created_at": "...",
  "updated_at": "..."
}
```

---

## Verify

The new campaign card appears on the **Campaigns** tab in the dashboard and on the public page at [http://localhost:3000](http://localhost:3000).

---

## Managing campaigns after creation

Each campaign card in the Campaigns tab has three actions:

| Button | What it does |
|---|---|
| **Edit** | Opens the Edit Campaign modal. You can update title, description, and goal amount. |
| **Pause / Activate** | Toggles status between `active` and `draft`. Paused campaigns stop accepting donations. |
| **Archive** (bin icon) | Soft-deletes the campaign by setting status to `archived`. Donation records are preserved. |

To edit via API:

```bash
curl -X PUT http://localhost:8000/api/v1/campaigns/<campaign-id> \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-service-role-key>" \
  -d '{ "title": "Updated Title", "goal_amount": 100000 }'
```

To archive via API:

```bash
curl -X DELETE http://localhost:8000/api/v1/campaigns/<campaign-id> \
  -H "X-API-Key: <your-service-role-key>"
```

---

## Troubleshooting

### 400 — "A campaign with slug '...' already exists"

Slugs are unique. Choose a different slug or check existing campaigns:

```bash
curl http://localhost:8000/api/v1/campaigns/all
```

### Campaign does not appear on the public page

Check that `status` is `"active"`. Campaigns with `"draft"` or `"archived"` status are filtered out from the public listing but still visible in the admin Campaigns tab.

---

## Slug rules

- Lowercase letters and numbers only
- Words separated by hyphens: `winter-blankets-2026`
- No spaces, underscores, or uppercase letters
- Pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

---

## Related

- [Campaign API reference](../reference/api.md#campaigns)
- [Database schema — campaigns table](../reference/database-schema.md#campaigns)
