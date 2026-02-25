<script>
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let to = $state("");
  let subject = $state("Email with embedded image");
  let loading = $state(false);
  let error = $state(null);
  let success = $state(null);
  let data = $state(null);

  async function handleSubmit() {
    loading = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/send-cid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to send email";
        return;
      }

      success = "Email with CID attachment sent successfully!";
      data = result;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="CID Attachments"
  description="Embed images directly in emails using Content-ID references."
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

  <div class="info">
    <p>
      This example embeds a sample image using Content-ID (<code>cid:</code>).
      The image is referenced in the HTML as <code>&lt;img src="cid:logo" /&gt;</code>
      and included as an attachment with a matching <code>content_id</code>.
    </p>
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Sending..." : "Send with CID Image"}
  </button>
</form>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/send-cid/+server.js
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import { EMAIL_FROM } from '$env/static/private';

export async function POST({ request }) {
  const { to, subject } = await request.json();

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html: '<p>Here is an embedded image:</p><img src="cid:logo" width="200" />',
    attachments: [
      {
        filename: 'logo.png',
        content: Buffer.from('iVBORw0KGgoAAAANSUhEUg...', 'base64'),
        content_id: 'logo',
      },
    ],
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}`}</code></pre>
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
