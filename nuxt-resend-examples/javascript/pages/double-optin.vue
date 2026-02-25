<script setup>
const email = ref("");
const name = ref("");
const loading = ref(false);
const success = ref(null);
const error = ref(null);

async function subscribe() {
  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    const data = await $fetch("/api/send", {
      method: "POST",
      body: {
        to: email.value,
        subject: "Confirm your subscription",
        message: `${name.value ? `Welcome, ${name.value}!` : "Welcome!"} Please confirm your subscription by clicking the link in this email.`,
      },
    });
    success.value = `Confirmation email sent!\nEmail ID: ${data.id}\n\nNext steps:\n1. User clicks the confirmation link in the email\n2. Resend fires an 'email.clicked' webhook event\n3. Your webhook handler updates the contact to unsubscribed=false`;
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to subscribe";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Double Opt-in"
      description="Implement a double opt-in subscription flow with Resend."
    />

    <form class="form" @submit.prevent="subscribe">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="user@example.com" required />
      </div>
      <div class="field">
        <label for="name">Name (optional)</label>
        <input id="name" v-model="name" type="text" placeholder="Jane Doe" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Subscribing..." : "Subscribe" }}
      </button>
    </form>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div class="info-section">
      <h3>How Double Opt-in Works</h3>
      <ol>
        <li>User submits their email address</li>
        <li>Create contact with <code>unsubscribed: true</code> (pending confirmation)</li>
        <li>Send a confirmation email with a link</li>
        <li>User clicks the confirmation link</li>
        <li>Resend fires an <code>email.clicked</code> webhook event</li>
        <li>Webhook handler updates the contact to <code>unsubscribed: false</code></li>
      </ol>
    </div>

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// Step 1: Create contact (pending)
const { data: contact } = await resend.contacts.create({
  audienceId,
  email,
  firstName: name,
  unsubscribed: true, // pending confirmation
});

// Step 2: Send confirmation email
const { data: sent } = await resend.emails.send({
  from: config.emailFrom,
  to: [email],
  subject: "Confirm your subscription",
  html: confirmationHtml,
});

// Step 3: In webhook handler (email.clicked event)
await resend.contacts.update({
  audienceId,
  id: contact.id,
  unsubscribed: false, // confirmed!
});</code></pre>
    </div>
  </div>
</template>

<style scoped>
.form {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
}

.field input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  font-size: 0.875rem;
}

button {
  padding: 0.625rem 1.25rem;
  background: #18181b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-section {
  margin-top: 2rem;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-section h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.info-section ol {
  padding-left: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.8;
}

.info-section code {
  background: #f4f4f5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.8rem;
}

.code-example {
  margin-top: 2rem;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
}

.code-example h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.code-example pre {
  background: #f4f4f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.5;
}
</style>
