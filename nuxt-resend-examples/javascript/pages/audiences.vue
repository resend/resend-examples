<script setup>
const contacts = ref([]);
const loading = ref(false);
const success = ref(null);
const error = ref(null);

async function loadContacts() {
  loading.value = true;
  error.value = null;

  try {
    const data = await $fetch("/api/audiences/contacts");
    contacts.value = data.contacts;
    success.value = `Loaded ${data.contacts.length} contact(s)`;
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to load contacts";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Audiences"
      description="Manage audiences and contacts with Resend. Set RESEND_AUDIENCE_ID in your environment."
    />

    <div class="actions">
      <button :disabled="loading" @click="loadContacts">
        {{ loading ? "Loading..." : "Load Contacts" }}
      </button>
    </div>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div v-if="contacts.length > 0" class="contacts-list">
      <h3>Contacts</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Unsubscribed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in contacts" :key="contact.id">
            <td>{{ contact.email }}</td>
            <td>{{ contact.first_name || "-" }}</td>
            <td>{{ contact.last_name || "-" }}</td>
            <td>{{ contact.unsubscribed ? "Yes" : "No" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// server/api/audiences/contacts.get.js
import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const query = getQuery(event);

  const audienceId = query.audienceId || config.resendAudienceId;
  const { data, error } = await resend.contacts.list({ audienceId });

  return { contacts: data?.data || [] };
});</code></pre>
    </div>
  </div>
</template>

<style scoped>
.actions {
  margin-bottom: 1rem;
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
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.contacts-list {
  margin-top: 1.5rem;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
}

.contacts-list h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th,
td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e4e4e7;
}

th {
  font-weight: 600;
  background: #f4f4f5;
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
