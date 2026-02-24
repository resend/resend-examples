<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let contacts = $state<unknown[]>([]);
  let loadingContacts = $state(false);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let data = $state<unknown>(null);

  async function loadContacts() {
    loadingContacts = true;
    error = null;

    try {
      const response = await fetch("/api/audiences/contacts");
      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to load contacts";
        return;
      }

      contacts = result.data || [];
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loadingContacts = false;
    }
  }

  let email = $state("");
  let firstName = $state("");
  let lastName = $state("");

  async function addContact() {
    loading = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/audiences/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to add contact";
        return;
      }

      success = "Contact added successfully!";
      data = result;
      email = "";
      firstName = "";
      lastName = "";
      await loadContacts();
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="Audiences"
  description="Manage contacts and audiences with the Resend API."
/>

<div class="sections">
  <section>
    <h2>Add Contact</h2>
    <form onsubmit={addContact} class="form">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={email} placeholder="contact@example.com" required />
      </div>

      <div class="field">
        <label for="firstName">First Name</label>
        <input id="firstName" type="text" bind:value={firstName} placeholder="John" />
      </div>

      <div class="field">
        <label for="lastName">Last Name</label>
        <input id="lastName" type="text" bind:value={lastName} placeholder="Doe" />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Contact"}
      </button>
    </form>
  </section>

  <section>
    <h2>Contacts</h2>
    <button class="secondary" onclick={loadContacts} disabled={loadingContacts}>
      {loadingContacts ? "Loading..." : "Load Contacts"}
    </button>

    {#if contacts.length > 0}
      <ul class="contact-list">
        {#each contacts as contact}
          <li>{JSON.stringify(contact)}</li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/audiences/contacts/+server.ts
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import { RESEND_AUDIENCE_ID } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const { data, error } = await resend.contacts.list({
    audienceId: RESEND_AUDIENCE_ID,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};

export const POST: RequestHandler = async ({ request }) => {
  const { email, firstName, lastName } = await request.json();

  const { data, error } = await resend.contacts.create({
    audienceId: RESEND_AUDIENCE_ID,
    email,
    firstName,
    lastName,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};`}</code></pre>
</details>

<style>
  .sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: #111827;
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

  .secondary {
    background-color: #ffffff;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .secondary:hover:not(:disabled) {
    background-color: #f9fafb;
  }

  .contact-list {
    margin-top: 1rem;
    padding-left: 1.25rem;
    font-size: 0.875rem;
    color: #374151;
  }

  .contact-list li {
    margin-bottom: 0.5rem;
    word-break: break-all;
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
