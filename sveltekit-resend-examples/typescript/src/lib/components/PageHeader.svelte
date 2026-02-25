<script lang="ts">
  interface Props {
    title: string;
    description: string;
  }

  let { title, description }: Props = $props();
</script>

<div class="page-header">
  <a href="/" class="back-link">&larr; Back to examples</a>
  <h1>{title}</h1>
  <p class="description">{description}</p>
</div>

<style>
  .page-header {
    margin-bottom: 2rem;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #6366f1;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.5rem;
  }

  .description {
    color: #6b7280;
    margin: 0;
    font-size: 1rem;
  }
</style>
