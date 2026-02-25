<script setup>
const to = ref("delivered@resend.dev");
const subject = ref("Hello from Resend!");
const message = ref("This email was sent using Resend with Nuxt.");
const loading = ref(false);
const success = ref(null);
const error = ref(null);

async function sendEmail() {
  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    const data = await $fetch("/api/send", {
      method: "POST",
      body: { to: to.value, subject: subject.value, message: message.value },
    });
    success.value = `Email sent successfully!\nEmail ID: ${data.id}`;
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to send email";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Send Email"
      description="Send a basic email using Resend."
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
        <textarea id="message" v-model="message" rows="4" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Sending..." : "Send Email" }}
      </button>
    </form>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// server/api/send.post.js
import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const { to, subject, message } = await readBody(event);

  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject,
    html: `&lt;p&gt;${message}&lt;/p&gt;`,
  });

  return { success: true, id: data?.id };
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
