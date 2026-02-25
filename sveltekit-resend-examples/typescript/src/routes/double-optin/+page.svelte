<script lang="ts">
  import { page } from "$app/stores";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let email = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let data = $state<unknown>(null);

  let confirmed = $derived($page.url.searchParams.get("confirmed") === "true");

  async function handleSubscribe() {
    loading = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/double-optin/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to subscribe";
        return;
      }

      success = "Confirmation email sent! Check your inbox.";
      data = result;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="Double Opt-in"
  description="Implement a subscription flow with email confirmation."
/>

{#if confirmed}
  <div class="confirmed">
    <h2>Subscription Confirmed!</h2>
    <p>Your email has been verified and you are now subscribed.</p>
  </div>
{/if}

<form onsubmit={handleSubscribe} class="form">
  <div class="field">
    <label for="email">Email Address</label>
    <input id="email" type="email" bind:value={email} placeholder="you@example.com" required />
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Subscribing..." : "Subscribe"}
  </button>
</form>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/double-optin/subscribe/+server.ts
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import {
  EMAIL_FROM,
  RESEND_AUDIENCE_ID,
  CONFIRM_REDIRECT_URL,
} from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { email } = await request.json();

  // Add unsubscribed contact to audience
  const { error: contactError } = await resend.contacts.create({
    audienceId: RESEND_AUDIENCE_ID,
    email,
    unsubscribed: true,
  });

  if (contactError) {
    return json({ error: contactError.message }, { status: 400 });
  }

  // Send confirmation email
  const confirmUrl = \`\${CONFIRM_REDIRECT_URL}&email=\${encodeURIComponent(email)}\`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: 'Confirm your subscription',
    html: \`
      <h1>Confirm your subscription</h1>
      <p>Click the link below to confirm your email address:</p>
      <a href="\${confirmUrl}">Confirm Subscription</a>
    \`,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};

// src/routes/api/double-optin/confirm/+server.ts
// POST: Update contact to subscribed
export const POST: RequestHandler = async ({ request }) => {
  const { email } = await request.json();

  const { data, error } = await resend.contacts.update({
    audienceId: RESEND_AUDIENCE_ID,
    email,
    unsubscribed: false,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};`}</code></pre>
</details>

<style>
  .confirmed {
    padding: 1.5rem;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }

  .confirmed h2 {
    color: #166534;
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
  }

  .confirmed p {
    color: #15803d;
    margin: 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 32rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  button {
    align-self: flex-start;
    padding: 0.5rem 1.25rem;
    background-color: #6366f1;
    color: #ffffff;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background-color: #4f46e5;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .code-example {
    margin-top: 2rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  summary {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  pre {
    margin: 0;
    padding: 1rem;
    background: #1f2937;
    color: #e5e7eb;
    font-size: 0.8rem;
    overflow-x: auto;
  }
</style>
