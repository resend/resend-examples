# Resend with Batch Emails

This example show how to send batch emails.

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
pnpm run dev
```

### 4. Send a POST request to `/api/send`

```bash
curl --location --request POST 'http://localhost:3000/api/send'
```
