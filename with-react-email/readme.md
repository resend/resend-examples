# Resend with React Email

This example show how to send Resend emails with React Email.

## How to run

### 1. Install the dependencies

```bash
yarn dev
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
import { EmailTemplate } from '../../transactional/emails/email-template';

const data = await resend.emails.send({
  from: 'bu@resend.dev',
  to: 'bu@resend.com',
  subject: 'Receipt for Your Payment',
  react: <EmailTemplate name="Bu Kinoshita" />,
});
```