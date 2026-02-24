<script>
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let to = $state("");
  let subject = $state("Email with attachment");
  let html = $state("<p>Please find the attachment.</p>");
  let filename = $state("document.txt");
  let content = $state("Hello from Resend + SvelteKit!");
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
      const response = await fetch("/api/send-attachment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html, filename, content }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to send email";
        return;
      }

      success = "Email with attachment sent successfully!";
      data = result;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="Attachments"
  description="Send an email with file attachments using Resend."
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

  <div class="field">
    <label for="filename">Attachment Filename</label>
    <input id="filename" type="text" bind:value={filename} required />
  </div>

  <div class="field">
    <label for="content">Attachment Content</label>
    <textarea id="content" bind:value={content} rows={3} required></textarea>
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Sending..." : "Send with Attachment"}
  </button>
</form>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/send-attachment/+server.js
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import { EMAIL_FROM } from '$env/static/private';

export async function POST({ request }) {
  const { to, subject, html, filename, content } = await request.json();

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
    attachments: [
      {
        filename,
        content: Buffer.from(content).toString('base64'),
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
