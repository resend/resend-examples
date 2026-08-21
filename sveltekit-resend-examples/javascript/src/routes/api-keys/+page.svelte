<script>
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let apiKeys = $state([]);
  let loadingKeys = $state(false);
  let loading = $state(false);
  let error = $state(null);
  let success = $state(null);
  let data = $state(null);

  async function loadApiKeys() {
    loadingKeys = true;
    error = null;

    try {
      const response = await fetch("/api/api-keys");
      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to load API keys";
        return;
      }

      apiKeys = result.data || [];
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loadingKeys = false;
    }
  }

  let name = $state("");
  let permission = $state("full_access");
  let domainId = $state("");

  async function createApiKey() {
    loading = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          permission,
          domainId: permission === "sending_access" ? domainId : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to create API key";
        return;
      }

      success = "API key created! Copy the token now — it won't be shown again.";
      data = result;
      name = "";
      domainId = "";
      await loadApiKeys();
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }

  let renamingId = $state(null);
  let renameValue = $state("");
  let renaming = $state(false);

  function startRename(key) {
    renamingId = key.id;
    renameValue = key.name;
  }

  function cancelRename() {
    renamingId = null;
    renameValue = "";
  }

  async function renameApiKey(id) {
    renaming = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: renameValue }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to rename API key";
        return;
      }

      success = "API key renamed successfully!";
      data = result;
      renamingId = null;
      renameValue = "";
      await loadApiKeys();
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      renaming = false;
    }
  }

  let deletingId = $state(null);

  async function deleteApiKey(id) {
    deletingId = id;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to delete API key";
        return;
      }

      success = "API key deleted successfully!";
      data = result;
      await loadApiKeys();
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      deletingId = null;
    }
  }
</script>

<PageHeader
  title="API Keys"
  description="Create, list, rename, and delete API keys."
/>

<div class="sections">
  <section>
    <h2>Create API Key</h2>
    <form onsubmit={createApiKey} class="form">
      <div class="field">
        <label for="name">Name</label>
        <input id="name" type="text" bind:value={name} placeholder="Production Sending Key" required />
      </div>

      <div class="field">
        <label for="permission">Permission</label>
        <select id="permission" bind:value={permission}>
          <option value="full_access">Full access</option>
          <option value="sending_access">Sending access</option>
        </select>
      </div>

      {#if permission === "sending_access"}
        <div class="field">
          <label for="domainId">Domain ID (optional)</label>
          <input id="domainId" type="text" bind:value={domainId} placeholder="Restrict to a single domain" />
        </div>
      {/if}

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Key"}
      </button>
    </form>
  </section>

  <section>
    <h2>API Keys</h2>
    <button class="secondary" onclick={loadApiKeys} disabled={loadingKeys}>
      {loadingKeys ? "Loading..." : "Load API Keys"}
    </button>

    {#if apiKeys.length > 0}
      <ul class="key-list">
        {#each apiKeys as key (key.id)}
          <li class="key-row">
            {#if renamingId === key.id}
              <input type="text" bind:value={renameValue} class="rename-input" />
              <button onclick={() => renameApiKey(key.id)} disabled={renaming}>
                {renaming ? "Saving..." : "Save"}
              </button>
              <button class="secondary" onclick={cancelRename} disabled={renaming}>
                Cancel
              </button>
            {:else}
              <span class="key-name">{key.name}</span>
              <button class="secondary" onclick={() => startRename(key)}>
                Rename
              </button>
              <button class="danger" onclick={() => deleteApiKey(key.id)} disabled={deletingId === key.id}>
                {deletingId === key.id ? "Deleting..." : "Delete"}
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/api-keys/+server.js
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';

export async function GET() {
  const { data, error } = await resend.apiKeys.list();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}

export async function POST({ request }) {
  const { name, permission, domainId } = await request.json();

  const { data, error } = await resend.apiKeys.create({
    name,
    permission,
    domainId,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}

export async function PATCH({ request }) {
  const { id, name } = await request.json();

  // Only \`name\` is patchable — a leaked key must not be able to
  // widen another key's scope via permission or domainId.
  const { data, error } = await resend.apiKeys.update(id, { name });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}

export async function DELETE({ request }) {
  const { id } = await request.json();

  const { data, error } = await resend.apiKeys.remove(id);

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}`}</code></pre>
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

  input,
  select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  input:focus,
  select:focus {
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

  .danger {
    background-color: #ffffff;
    color: #dc2626;
    border: 1px solid #fca5a5;
  }

  .danger:hover:not(:disabled) {
    background-color: #fef2f2;
  }

  .key-list {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .key-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .key-name {
    flex: 1;
    font-size: 0.875rem;
    color: #111827;
    font-weight: 500;
    word-break: break-all;
  }

  .rename-input {
    flex: 1;
  }

  .key-row button {
    align-self: auto;
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

  .code-example pre {
    margin: 0;
    padding: 1rem;
    background: #1f2937;
    color: #e5e7eb;
    font-size: 0.8rem;
    overflow-x: auto;
  }
</style>
