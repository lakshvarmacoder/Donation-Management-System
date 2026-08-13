# Supabase setup

1. In the Supabase SQL Editor, run `schema.sql`.
2. Create an admin user in **Authentication > Users**, then run the bootstrap `insert` shown at the end of `schema.sql` using that user's ID.
3. Copy `frontend/.env.example` to `frontend/.env.local` and fill in the Supabase and Razorpay values.
4. In Razorpay, add a webhook targeting `https://YOUR-DOMAIN/api/payments/razorpay/webhook` for `payment.captured` and `payment.failed`, then set its secret as `RAZORPAY_WEBHOOK_SECRET`.

Online donation writes go through the server-side API, not directly from the browser. The Razorpay webhook is the only path that marks an online donation as completed; that change automatically issues a receipt record.
