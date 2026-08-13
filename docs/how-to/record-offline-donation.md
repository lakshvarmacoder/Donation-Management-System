# How to record an offline donation

Log a cash or cheque donation that was collected in person, outside of the online payment flow.

## Before you start

- Backend is running at `http://localhost:8000`
- At least one active campaign exists

---

## Steps

### 1. Open the admin dashboard

Go to [http://localhost:3000/dms](http://localhost:3000/dms) and sign in.

### 2. Use the offline gift form

Click **Record offline gift** and fill in:

| Field | Required | Notes |
|---|---|---|
| Donor name | Yes | 2–120 characters |
| Donor email | Yes | Valid email address |
| Amount (₹) | Yes | Must be greater than 0 |
| Campaign | No | Defaults to the first active campaign |

Click **Submit**.

---

### Alternative: use the API directly

```bash
curl -X POST http://localhost:8000/api/v1/donations/offline \
  -H "Content-Type: application/json" \
  -d '{
    "donor_name": "Ramesh Kumar",
    "donor_email": "ramesh@example.com",
    "amount": 5000
  }'
```

To link to a specific campaign, include `campaign_id`:

```bash
curl -X POST http://localhost:8000/api/v1/donations/offline \
  -H "Content-Type: application/json" \
  -d '{
    "donor_name": "Ramesh Kumar",
    "donor_email": "ramesh@example.com",
    "amount": 5000,
    "campaign_id": "<campaign-uuid>"
  }'
```

---

## Verify

The donation is created with `status: "completed"` and `source: "offline"` immediately. Because the status is `completed`, the database trigger fires and a receipt row is created automatically in the `receipts` table.

Check in the admin dashboard — the donation appears in the table and the campaign's `amount_raised` increases.

---

## Troubleshooting

### 404 — "No active campaign found"

No campaign has `status = 'active'`. Create one first:

→ [How to create a campaign](create-a-campaign.md)

---

## Related

- [Donations API reference](../reference/api.md#donations)
- [How receipts are generated](../explanation/payment-flow.md#receipt-generation)
