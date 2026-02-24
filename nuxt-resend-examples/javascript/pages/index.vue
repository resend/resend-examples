<script setup>
const examples = [
  {
    title: "Send Email",
    description: "Send a basic email with Resend",
    path: "/send-email",
  },
  {
    title: "Attachments",
    description: "Send an email with file attachments",
    path: "/attachments",
  },
  {
    title: "CID Attachments",
    description: "Send an email with inline CID images",
    path: "/cid-attachments",
  },
  {
    title: "Scheduling",
    description: "Schedule an email for later delivery",
    path: "/scheduling",
  },
  {
    title: "Templates",
    description: "Send an email using a Resend template",
    path: "/templates",
  },
  {
    title: "Prevent Threading",
    description: "Send emails that avoid Gmail threading",
    path: "/prevent-threading",
  },
  {
    title: "Audiences",
    description: "Manage audiences and contacts",
    path: "/audiences",
  },
  {
    title: "Domains",
    description: "Manage sending domains",
    path: "/domains",
  },
  {
    title: "Double Opt-in",
    description: "Double opt-in subscription flow",
    path: "/double-optin",
  },
  {
    title: "Inbound",
    description: "Inbound email handling",
    path: "/inbound",
  },
];
</script>

<template>
  <div>
    <PageHeader
      title="Nuxt + Resend Examples"
      description="Full-stack examples of sending emails with Resend and Nuxt 3."
    />
    <div class="grid">
      <NuxtLink
        v-for="example in examples"
        :key="example.path"
        :to="example.path"
        class="card"
      >
        <h3>{{ example.title }}</h3>
        <p>{{ example.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.card {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  border-color: #18181b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 0.875rem;
  color: #71717a;
}
</style>
