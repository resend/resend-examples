<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let to = $state("");
  let subject = $state("Important notification");
  let html = $state("<p>This email will not be threaded with previous messages.</p>");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let data = $state<unknown>(null);

  async function handleSubmit() {
    loading = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/send-prevent-threading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to send email";
        return;
      }

      success = "Non-threaded email sent successfully!";
      data = result;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="Prevent Threading"
  description="Send emails that won't be grouped into threads by email clients."
/>

<form onsubmit={handleSubmit} class="form">
  <div class="field">
    <label for="to">To</label>
    <input id="to" type="email" bind:value={to} placeholder="recipient@example.com" required />
  </div>

  <div class="field">
    <label for="subject">Subject</label>
    <input id="subject" type="text" bind:value={subject} required />
  </div>

  <div class="field">
    <label for="html">HTML Content</label>
    <textarea id="html" bind:value={html} rows={3} required></textarea>
  </div>

  <div class="info">
    <p>
      This sets custom <code>X-Entity-Ref-ID</code> and <code>References</code> headers
      with unique values to prevent email clients from threading messages together.
    </p>
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Sending..." : "Send Non-Threaded Email"}
  </button>
</form>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/send-prevent-threading/+server.ts
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import { EMAIL_FROM } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { to, subject, html } = await request.json();
  const uniqueId = \`<\${crypto.randomUUID()}@resend.dev>\`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
    headers: {
      'X-Entity-Ref-ID': uniqueId,
      'References': uniqueId,
    },
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};`}</code></pre>
</details>

<style>
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

  input,
  textarea {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .info {
    padding: 0.75rem 1rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #1e40af;
  }

  .info p {
    margin: 0;
    line-height: 1.5;
  }

  .info code {
    background: rgba(0, 0, 0, 0.06);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
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
