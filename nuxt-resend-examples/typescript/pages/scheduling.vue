<script setup lang="ts">
const to = ref("delivered@resend.dev");
const subject = ref("Scheduled Email");
const message = ref("This email was scheduled for later delivery.");
const delayMinutes = ref(5);
const loading = ref(false);
const success = ref<string | null>(null);
const error = ref<string | null>(null);

async function sendEmail() {
  loading.value = true;
  success.value = null;
  error.value = null;

  const scheduledAt = new Date(
    Date.now() + delayMinutes.value * 60 * 1000
  ).toISOString();

  try {
    const data = await $fetch("/api/send-scheduled", {
      method: "POST",
      body: {
        to: to.value,
        subject: subject.value,
        message: message.value,
        scheduledAt,
      },
    });
    success.value = `Email scheduled successfully!\nEmail ID: ${data.id}\nScheduled for: ${data.scheduledAt}`;
  } catch (err: any) {
    error.value = err.data?.message || err.message || "Failed to schedule email";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Scheduling"
      description="Schedule an email for later delivery. Maximum scheduling window: 7 days."
    />

    <form class="form" @submit.prevent="sendEmail">
      <div class="field">
        <label for="to">To</label>
        <input id="to" v-model="to" type="email" required />
      </div>
      <div class="field">
        <label for="subject">Subject</label>
        <input id="subject" v-model="subject" type="text" required />
      </div>
      <div class="field">
        <label for="message">Message</label>
        <textarea id="message" v-model="message" rows="3" required />
      </div>
      <div class="field">
        <label for="delay">Delay (minutes)</label>
        <input id="delay" v-model.number="delayMinutes" type="number" min="1" max="10080" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Scheduling..." : "Schedule Email" }}
      </button>
    </form>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// server/api/send-scheduled.post.ts
const scheduledAt = new Date(
  Date.now() + 5 * 60 * 1000
).toISOString();

const { data, error } = await resend.emails.send({
  from: config.emailFrom,
  to: [to],
  subject,
  html: "&lt;p&gt;Hello from the future!&lt;/p&gt;",
  scheduledAt,
});

// To cancel: resend.emails.cancel(data.id)</code></pre>
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

.field input,
.field textarea {
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
