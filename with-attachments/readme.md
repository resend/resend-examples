# Resend with attachments

This example show how to send Resend emails with attachments.

## How to run

### 1. Install the dependencies

```bash
yarn install
```

### 2. Create a `.env` file at the root and add your Resend API

```bash
RESEND_API_KEY=re_8m9gwsVG_6n94KaJkJ42Yj6qSeVvLq9xF
```

### 3. Run the server

```bash
yarn dev
```

### 4. Update the `from` and `to` in the `app/api/send/route.ts`

You can update the `from` and `to` here so sending is done from your own domain and to your email address. The `to` must be a verified domain in your account.

```tsx
const data = await resend.emails.send({
  from: 'Acme <receipts@acme.com>',
  to: ['user@example.com'],
  subject: 'Receipt for your payment',
  html: '<p>Thanks for the payment</p>',
  attachments: [
    {
      path: 'https://acme.com/static/sample/invoice.pdf',
      filename: 'sample-invoice.pdf',
    },
  ],
});
```

### 5. Send a POST request to `/api/send`

```bash
curl --location --request POST 'http://localhost:3000/api/send'
```
