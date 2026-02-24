<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let to = $state("");
  let templateId = $state("");
  let firstName = $state("");
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
      const dataPayload: Record<string, string> = {};
      if (firstName) dataPayload.firstName = firstName;

      const response = await fetch("/api/send-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, templateId, data: dataPayload }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to send email";
        return;
      }

      success = "Template email sent successfully!";
      data = result;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="Templates"
  description="Send emails using pre-built Resend templates."
/>

<form onsubmit={handleSubmit} class="form">
  <div class="field">
    <label for="to">To</label>
    <input id="to" type="email" bind:value={to} placeholder="recipient@example.com" required />
  </div>

  <div class="field">
    <label for="templateId">Template ID</label>
    <input id="templateId" type="text" bind:value={templateId} placeholder="tmpl_123456789" required />
  </div>

  <div class="field">
    <label for="firstName">First Name (template variable)</label>
    <input id="firstName" type="text" bind:value={firstName} placeholder="John" />
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Sending..." : "Send Template Email"}
  </button>
</form>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/send-template/+server.ts
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import { EMAIL_FROM } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [body.to],
    subject: 'Template Email',
    react: undefined,
    html: '',
    headers: {
      'X-Resend-Template-Id': body.templateId,
    },
    ...(body.data && Object.keys(body.data).length > 0
      ? { tags: [{ name: 'data', value: JSON.stringify(body.data) }] }
      : {}),
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
