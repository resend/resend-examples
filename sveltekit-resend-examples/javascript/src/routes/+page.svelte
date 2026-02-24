<script>
  const examples = [
    {
      title: "Send Email",
      description: "Send a basic email using the Resend API.",
      href: "/send-email",
    },
    {
      title: "Attachments",
      description: "Send an email with file attachments.",
      href: "/attachments",
    },
    {
      title: "CID Attachments",
      description: "Embed images in emails using Content-ID.",
      href: "/cid-attachments",
    },
    {
      title: "Scheduling",
      description: "Schedule emails for future delivery.",
      href: "/scheduling",
    },
    {
      title: "Templates",
      description: "Send emails using Resend templates.",
      href: "/templates",
    },
    {
      title: "Prevent Threading",
      description: "Prevent email clients from threading messages.",
      href: "/prevent-threading",
    },
    {
      title: "Audiences",
      description: "Manage contacts and audiences.",
      href: "/audiences",
    },
    {
      title: "Domains",
      description: "List and manage sending domains.",
      href: "/domains",
    },
    {
      title: "Double Opt-in",
      description: "Subscription flow with email confirmation.",
      href: "/double-optin",
    },
    {
      title: "Inbound",
      description: "Receive and process inbound emails via webhooks.",
      href: "/inbound",
    },
  ];
</script>

<div class="home">
  <h1>Resend + SvelteKit Examples</h1>
  <p class="subtitle">
    Explore different ways to send and manage emails with Resend in a SvelteKit
    application.
  </p>

  <div class="grid">
    {#each examples as example}
      <a href={example.href} class="card">
        <h2>{example.title}</h2>
        <p>{example.description}</p>
      </a>
    {/each}
  </div>
</div>

<style>
  .home {
    text-align: center;
    padding-top: 2rem;
  }

  h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: #111827;
    margin: 0 0 0.75rem;
  }

  .subtitle {
    color: #6b7280;
    font-size: 1.125rem;
    margin: 0 0 3rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    text-align: left;
  }

  .card {
    display: block;
    padding: 1.5rem;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    text-decoration: none;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .card:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }

  .card h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem;
  }

  .card p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
</style>
