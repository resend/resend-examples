<script setup lang="ts">
const to = ref("delivered@resend.dev");
const subject = ref("Order Confirmation");
const count = ref(3);
const loading = ref(false);
const success = ref<string | null>(null);
const error = ref<string | null>(null);

async function sendEmails() {
  loading.value = true;
  success.value = null;
  error.value = null;

  const results: string[] = [];

  try {
    for (let i = 1; i <= count.value; i++) {
      const data = await $fetch("/api/send", {
        method: "POST",
        body: {
          to: to.value,
          subject: subject.value,
          message: `This is email #${i} -- each appears as a separate conversation in Gmail.`,
        },
      });
      results.push(`Email #${i} sent: ${data.id}`);
    }
    success.value =
      results.join("\n") +
      "\n\nAll emails sent with unique X-Entity-Ref-ID headers.\nEach will appear as a separate conversation in Gmail.";
  } catch (err: any) {
    error.value = err.data?.message || err.message || "Failed to send emails";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Prevent Threading"
      description="Send emails with unique X-Entity-Ref-ID headers so Gmail treats each as a separate conversation."
    />

    <form class="form" @submit.prevent="sendEmails">
      <div class="field">
        <label for="to">To</label>
        <input id="to" v-model="to" type="email" required />
      </div>
      <div class="field">
        <label for="subject">Subject (same for all)</label>
        <input id="subject" v-model="subject" type="text" required />
      </div>
      <div class="field">
        <label for="count">Number of Emails</label>
        <input id="count" v-model.number="count" type="number" min="1" max="10" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Sending..." : "Send Emails" }}
      </button>
    </form>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// Gmail groups emails by subject and Message-ID/References headers.
// Adding a unique X-Entity-Ref-ID header prevents this grouping.
const { data, error } = await resend.emails.send({
  from: config.emailFrom,
  to: [to],
  subject: "Order Confirmation",
  html: "&lt;p&gt;This is a separate conversation&lt;/p&gt;",
  headers: {
    "X-Entity-Ref-ID": crypto.randomUUID(),
  },
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
