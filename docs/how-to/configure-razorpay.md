# How to configure Razorpay

Connect the system to Razorpay so online donations go through a real payment gateway.

> Without Razorpay credentials the system runs in demo mode — orders are created locally and no real payment is processed. Demo mode is fine for development.

## Before you start

- A Razorpay account (test mode is sufficient for local development)
- Backend `.env` file accessible

---

## Steps

### 1. Get your Razorpay test credentials

1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Generate a test key pair
4. Copy the **Key ID** and **Key Secret**

### 2. Set up the webhook secret

1. In the Razorpay dashboard go to **Settings → Webhooks**
2. Click **Add new webhook**
3. Set the URL — choose based on your setup:
   - FastAPI backend: `http://<your-public-url>/api/v1/webhooks/razorpay`
   - Next.js only: `http://<your-public-url>/api/payments/razorpay/webhook`
4. Select events: `payment.captured`, `payment.failed`
5. Set a webhook secret and copy it

> For local development, use [ngrok](https://ngrok.com) to expose your local server: `ngrok http 8000` (for FastAPI) or `ngrok http 3000` (for Next.js).

> The webhook is a secondary confirmation. The primary completion path is the frontend calling `POST /api/v1/donations/verify` after checkout.

### 3. Add credentials to both services

Open `backend/.env` and set:

```env
RAZORPAY_KEY_ID=rzp_test_<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
```

Open `frontend/.env.local` and set:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
```

> The frontend needs its own copy of these credentials because the Next.js donation API route (`/api/donations`) can create Razorpay orders directly as a fallback when the FastAPI backend is unreachable. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is also embedded in the browser bundle to open the checkout modal.

### 4. Restart the backend

```bash
# Stop the running server (Ctrl+C), then:
uvicorn app.main:app --reload
```

---

## Verify

Make a test donation on the public page. After completing payment in the Razorpay checkout modal, the donation status should change from `pending` to `completed` in the admin dashboard.

You can also check the webhook delivery log in the Razorpay dashboard under **Settings → Webhooks → Recent deliveries**.

---

## Troubleshooting

### Webhook signature verification fails (401)

The `RAZORPAY_WEBHOOK_SECRET` in your `.env` must exactly match the secret set in the Razorpay dashboard. Check for trailing spaces or newlines.

### Orders created but status stays "pending"

The webhook is not reaching your server. Confirm:
1. Your ngrok tunnel is running
2. The webhook URL in Razorpay matches your ngrok URL
3. The backend is running and reachable

---

## Related

- [Webhooks API reference](../reference/api.md#webhooks)
- [Payment flow explanation](../explanation/payment-flow.md)
- [Environment variables reference](../reference/environment-variables.md)
