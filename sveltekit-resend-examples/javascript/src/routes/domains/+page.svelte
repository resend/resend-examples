<script>
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ResultDisplay from "$lib/components/ResultDisplay.svelte";

  let domains = $state([]);
  let loading = $state(false);
  let error = $state(null);
  let success = $state(null);
  let data = $state(null);

  async function loadDomains() {
    loading = true;
    error = null;
    success = null;
    data = null;

    try {
      const response = await fetch("/api/domains");
      const result = await response.json();

      if (!response.ok) {
        error = result.error || "Failed to load domains";
        return;
      }

      domains = result.data || [];
      success = `Loaded ${domains.length} domain(s)`;
      data = result;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<PageHeader
  title="Domains"
  description="List and manage your sending domains."
/>

<div class="actions">
  <button onclick={loadDomains} disabled={loading}>
    {loading ? "Loading..." : "Load Domains"}
  </button>
</div>

{#if domains.length > 0}
  <div class="domain-list">
    {#each domains as domain}
      <div class="domain-card">
        <pre>{JSON.stringify(domain, null, 2)}</pre>
      </div>
    {/each}
  </div>
{/if}

<ResultDisplay {loading} {error} {success} {data} />

<details class="code-example">
  <summary>View example code</summary>
  <pre><code>{`// src/routes/api/domains/+server.js
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';

export async function GET() {
  const { data, error } = await resend.domains.list();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}`}</code></pre>
</details>

<style>
  .actions {
    margin-bottom: 1.5rem;
  }

  button {
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

  .domain-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .domain-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .domain-card pre {
    margin: 0;
    padding: 1rem;
    background: #f9fafb;
    font-size: 0.8rem;
    overflow-x: auto;
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
