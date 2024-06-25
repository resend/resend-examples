# Resend with iCal

This example show how to send Resend emails with iCal.

## How to run

### 1. Install the dependencies

```bash
pnpm install
```

### 2. Create a `.env` file at the root and add your Resend API

```bash
RESEND_API_KEY=re_8m9gwsVG_6n94KaJkJ42Yj6qSeVvLq9xF
```

### 3. Run the server

```bash
pnpm dev
```

### 4. Update the `from` and `to` in the `send.ts`

You can update the `from` and `to` here so send from your own domain and to your email address. The `to` must be a verified `domain` in your account.

```tsx
const data = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: '30 Minute Meeting',
  attachments: [
    {
      path: 'https://gist.githubusercontent.com/zenorocha/4317a548e4cca166d0f50d54733f3f03/raw/37edb0735ab07e663b794d348dd99d7e6c9575be/invite.ics',
      filename: 'invite.ics',
    },
  ],
  html: '<h1>Thanks for the invite</h1>',
});
```

### 4. Send a POST request to `/api/send`

```bash
curl --location --request POST 'http://localhost:3000/api/send'
```
