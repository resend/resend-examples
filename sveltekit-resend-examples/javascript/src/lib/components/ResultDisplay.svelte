<script>
  let { loading, error, success, data = null } = $props();
</script>

{#if loading}
  <div class="result loading">
    <p>Sending...</p>
  </div>
{/if}

{#if error}
  <div class="result error">
    <p class="label">Error</p>
    <p>{error}</p>
  </div>
{/if}

{#if success}
  <div class="result success">
    <p class="label">Success</p>
    <p>{success}</p>
    {#if data}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    {/if}
  </div>
{/if}

<style>
  .result {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid;
  }

  .loading {
    border-color: #d1d5db;
    background-color: #f9fafb;
    color: #374151;
  }

  .error {
    border-color: #fca5a5;
    background-color: #fef2f2;
    color: #991b1b;
  }

  .success {
    border-color: #86efac;
    background-color: #f0fdf4;
    color: #166534;
  }

  .label {
    font-weight: 600;
    margin: 0 0 0.25rem;
  }

  pre {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
