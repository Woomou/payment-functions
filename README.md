# payment-functions

This repository contains Cloudflare Worker scripts for processing payments through PayPal and Stripe. It also includes small test pages for local development.

## Local Test Servers

### PayPal

A Python server and HTML files for PayPal live under `test-page`. Start the server from that directory:

```bash
cd test-page
python3 server.py --switcher   # use --switcher for sandbox/live toggle
```

By default the server opens `index-switcher.html`. Use `python3 server.py` to serve the sandbox-only `index.html`.

### Stripe

A Stripe test page is provided as `stripe.html` along with a simple server script `stripe-server.py` in `test-page`.
Run it with:

```bash
cd test-page
python3 stripe-server.py
```

Navigate to `http://localhost:8000/stripe.html` to test Stripe payments against your Worker.

## Environment Variables

Configure these variables in the Cloudflare dashboard before deploying:

**PayPal**
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENVIRONMENT`

**Stripe**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
