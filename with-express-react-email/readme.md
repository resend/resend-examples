# Resend with Express and React Email

This example show how to send Resend emails with Express and React Email.

## How to run

### 1. Install the dependencies

```bash
yarn
```

### 2. Create a `.env` file at the root and add your Resend API

```bash
RESEND_API_KEY=re_8m9gwsVG_6n94KaJkJ42Yj6qSeVvLq9xF
```

### 3. Run the server

```bash
yarn dev
```

### 4. Update the `from` and `to` in the `send.ts`

You can update the `from` and `to` here so send from your own domain and to your email address. The `to` must be a verified `domain` in your account.

```tsx
const data = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Waitlist',
  html: '<h1>Hi</h1>',
  headers: {
    'X-Entity-Ref-ID': uuid(),
  },
});
```

_Note_: `babel-node`` is not meant for production use. It's recommended to precompile your files and run the compiled resources in production.
