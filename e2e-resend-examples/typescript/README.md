# Resend email verification example

A small [Next.js](https://nextjs.org) app that checks a person owns an email address. You enter your email, the app sends you a 6 digit code with [Resend](https://resend.com), and you type the code back in to prove the address is yours.

The project also has end-to-end tests written with [e2e](https://e2e.com). The tests drive the app in a real browser and send real emails. They read each code from a real inbox, so they prove the whole flow works: the code is sent, it arrives, and the app accepts it. 

## How it works

### The app

- The page shows one of three screens: enter your email, enter your code, or "Email verified".
- When you submit your email, a server action ([app/actions.ts](app/actions.ts)) creates a random 6 digit code and sends it with the Resend Node.js SDK.
- The code, the email address, an expiry time and an attempt count are stored in the session. The session lives in an encrypted, HTTP-only cookie (using [iron-session](https://github.com/vvo/iron-session)), so the browser can't read the code.
- When you submit a code, the app checks it against the session:
  - A correct code marks the email as verified.
  - A wrong code shows how many attempts are left.
  - After 5 wrong attempts, or after 10 minutes, the code stops working and you need to request a new one.

### The tests

- The tests live in [tests/email-verification.e2e.ts](tests/email-verification.e2e.ts).
- Each test gets an `inbox` [fixture](tests/support/inbox.ts) with its own unique email address. The address is built from `E2E_INBOX_ADDRESS`. For example, `tests@example.com` becomes `tests+3f9a1c2b@example.com`. That way tests never read each other's emails.
- A test types the address into the app and asks for a code. It then waits for the email to arrive using Resend's [receiving API](https://resend.com/docs/api-reference/emails/list-received-emails), reads the code from the email and types it into the app.
- The test runner starts the app for you on a free port, so you don't need to run the dev server yourself.

## Getting started

### What you need

- [Node.js](https://nodejs.org) 22 or later
- A [Resend](https://resend.com) account

### 1. Set up Resend

1. [Sign up for Resend](https://resend.com/signup), or log in.
2. **Create an API key.** Go to [API Keys](https://resend.com/api-keys) and create a key with full access. The tests need full access to read received emails.
3. **Add a domain for sending.** Go to [Domains](https://resend.com/domains), add a domain you own and add the DNS records Resend gives you. Once it's verified, you can send from any address on it, like `verify@yourdomain.com`.
4. **Get an address that can receive email.** The tests need somewhere for the codes to arrive. You can either:
   - turn on receiving for your domain on its page in [Domains](https://resend.com/domains) and add the MX record, then use any address on it, like `tests@yourdomain.com`; or
   - use the `<id>.resend.app` subdomain that Resend gives your account. It accepts email at any address, so you can use something like `tests@<id>.resend.app`. To find it, go to the [Emails](https://resend.com/emails) page, select the **Receiving** tab, click the three dots button and select **Receiving address**.

   See [Receiving emails](https://resend.com/docs/dashboard/receiving/introduction) for more detail.

### 2. Download and install

```sh
git clone <this-repository-url> resend-e2e-example
cd resend-e2e-example
npm install
```

### 3. Configure

Copy the example environment file:

```sh
cp .env.example .env
```

Then fill in `.env`:

| Variable            | What to put in it                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`    | The API key from step 1                                                                      |
| `RESEND_FROM_EMAIL` | The address emails come from, on your verified domain, e.g. `Verify <verify@yourdomain.com>` |
| `SESSION_SECRET`    | A random string of at least 32 characters. Create one with `openssl rand -base64 32`         |
| `E2E_INBOX_ADDRESS` | Only needed for the tests: your receiving address from step 1                                |

### 4. Run the app

```sh
npm run dev
```

Open the URL it prints (usually [http://localhost:3000](http://localhost:3000)), enter your email and check your inbox for the code.

To build and run a production version instead:

```sh
npm run build
npm start
```

### 5. Run the tests

```sh
npm run test:e2e
```

The runner starts the app, opens a browser and runs every test. The first run downloads a browser, so it takes a little longer. Each test sends a real email and waits up to 60 seconds for it to arrive.

To test an app that is already running, set `APP_URL`:

```sh
APP_URL=http://localhost:3000 npm run test:e2e
```

If a test fails, the runner prints the step that failed and a link to a trace in `.e2e/results/`.

You can also check code style with `npm run lint`.
