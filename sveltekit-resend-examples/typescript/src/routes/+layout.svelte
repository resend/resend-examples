<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="app">
  <nav>
    <div class="nav-inner">
      <a href="/" class="logo">Resend + SvelteKit</a>
      <div class="nav-links">
        <a href="/send-email">Send</a>
        <a href="/attachments">Attachments</a>
        <a href="/scheduling">Schedule</a>
        <a href="/templates">Templates</a>
        <a href="/audiences">Audiences</a>
        <a href="/domains">Domains</a>
      </div>
    </div>
  </nav>

  <main>
    {@render children()}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
    background-color: #f9fafb;
    color: #111827;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app {
    min-height: 100vh;
  }

  nav {
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 1.5rem;
  }

  .nav-inner {
    max-width: 64rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }

  .logo {
    font-weight: 700;
    font-size: 1.125rem;
    color: #111827;
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
  }

  .nav-links a {
    color: #6b7280;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .nav-links a:hover {
    color: #111827;
  }

  main {
    max-width: 64rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
</style>
