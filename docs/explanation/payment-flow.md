# Payment and donation flow

This page explains how money moves through the system — from a donor clicking "Donate" to a receipt appearing in the database.

---

## Online donation flow

### 1. Donor submits the form

The frontend sends a `POST /api/v1/donations` with the donor's details and the campaign slug.

### 2. Pending record is created

The backend verifies the campaign is active, then inserts a donation row with `status = 'pending'`. This record exists before any payment happens so no donation is ever lost — even if the browser closes mid-checkout.

### 3. Razorpay order is created

The backend calls the Razorpay Orders API (`POST https://api.razorpay.com/v1/orders`) with the amount in paise (1 INR = 100 paise). Razorpay returns an `order_id`.

The backend stores `gateway_order_id` on the donation row and returns the `order_id` and `key_id` to the frontend.

### 4. Checkout modal opens

The frontend uses the Razorpay JavaScript SDK to open the payment modal. The donor enters card/UPI/netbanking details and completes payment on Razorpay's hosted UI.

### 5. Razorpay sends a webhook

After payment is captured, Razorpay sends a `POST` to `/api/v1/webhooks/razorpay` with a `payment.captured` or `order.paid` event.

### 6. Signature is verified

The backend computes `HMAC-SHA256(body, RAZORPAY_WEBHOOK_SECRET)` and compares it to the `x-razorpay-signature` header. If they don't match, the request is rejected with `401`.

### 7. Frontend calls the verify endpoint

After the Razorpay modal closes successfully, the frontend calls `POST /api/v1/donations/verify` with:

```json
{
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "<hmac-sha256>"
}
```

The backend verifies the signature using `HMAC-SHA256(order_id|payment_id, RAZORPAY_KEY_SECRET)` and updates the donation to `status = 'completed'`. This gives the donor immediate confirmation without waiting for the webhook.

For demo orders (`order_demo_*`), signature verification is skipped automatically.

### 8. Razorpay webhook arrives (secondary confirmation)

Razorpay also sends a `payment.captured` webhook to either:
- `POST /api/v1/webhooks/razorpay` (FastAPI) — updates via SQLAlchemy
- `POST /api/payments/razorpay/webhook` (Next.js) — updates via Supabase admin client

This is a safety net. If the verify call already completed the donation, the webhook update is a no-op.

### 9. Receipt is created

The PostgreSQL trigger `donations_issue_receipt` fires automatically after the status update. It inserts a row into `receipts` with a receipt number in the format `SF-YYYYMMDD-XXXXXXXX`.

---

## Offline donation flow

Offline donations skip steps 2–7 entirely.

The admin submits the offline gift form → `POST /api/v1/donations/offline` → donation is created directly with `status = 'completed'` → the same DB trigger fires → receipt is created.

---

## Demo mode

If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not set, `RazorpayService.create_order()` returns a locally-generated fake order:

```json
{
  "id": "order_demo_<receipt-id>",
  "amount": 100000,
  "currency": "INR",
  "status": "created"
}
```

No real payment is processed. The donation stays `pending` because no webhook arrives. This is intentional for local development — use the offline donation endpoint to test the completed → receipt path.

---

## Receipt generation

Receipts are created by the database trigger, not by application code. This is intentional.

The trigger runs inside the same transaction as the status update. If the application crashes after updating the donation but before calling a receipt service, the receipt is still created. There is no window for inconsistency.

Receipt number format: `SF-YYYYMMDD-XXXXXXXX`

- `SF` — Saanjh Foundation prefix
- `YYYYMMDD` — date of issue
- `XXXXXXXX` — first 8 characters of the donation UUID (uppercase, hyphens removed)

Example: `SF-20260315-A1B2C3D4`

The trigger uses `ON CONFLICT (donation_id) DO NOTHING`, so calling it twice for the same donation is safe.

---

## What happens on payment failure

Razorpay sends a `payment.failed` event. The webhook handler sets `status = 'failed'`. No receipt is created. The donor can attempt payment again (a new `POST /api/v1/donations` creates a new pending record and a new Razorpay order).

---

## Related

- [How to configure Razorpay](../how-to/configure-razorpay.md)
- [Webhooks API reference](../reference/api.md#webhooks)
- [Database schema — triggers](../reference/database-schema.md#functions)
