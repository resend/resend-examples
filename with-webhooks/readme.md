# Resend with Webhooks

This example show how to send Resend emails with webhooks.

## How to run

### 1. Install the dependencies

```bash
yarn dev
```

### 2. Create a webhook on Resend dashboard

- Go to the [Webhooks page](https://resend.com/webhooks)
- The endpoint URL needs to be HTTPs (You can use [Ngrok](https://ngrok.com/) to point to the Next.js App server)
- Copy the Webhook signing secret after creating the Webhook

### 3. Create a `.env` file at the root and add the webhook signing secret:

```bash
WEBHOOK_SECRET=whsec_alJairX6NuQxWqjdF8PIQd48gh2IQOHl
```

### 3. Run the server

```bash
yarn dev
```

### 4. Send an email

```tsx
const data = await resend.emails.send({
  from: 'bu@resend.dev',
  to: 'bu@resend.com',
  subject: 'Receipt for Your Payment',
  text: 'Thanks for the payment',
});
```

### 5. The webhook event message should send a request to the Next.js App