<script setup>
const domains = ref([]);
const newDomain = ref("");
const region = ref("us-east-1");
const loading = ref(false);
const success = ref(null);
const error = ref(null);

async function loadDomains() {
  loading.value = true;
  error.value = null;

  try {
    const data = await $fetch("/api/domains");
    domains.value = data.domains;
    success.value = `Found ${data.domains.length} domain(s)`;
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to load domains";
  } finally {
    loading.value = false;
  }
}

async function createDomain() {
  if (!newDomain.value) return;

  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    const data = await $fetch("/api/domains", {
      method: "POST",
      body: { name: newDomain.value, region: region.value },
    });
    success.value = `Domain created: ${data.domain?.name} (ID: ${data.domain?.id})`;
    newDomain.value = "";
    await loadDomains();
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to create domain";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Domains"
      description="Manage your sending domains with Resend."
    />

    <div class="section">
      <h3>List Domains</h3>
      <button :disabled="loading" @click="loadDomains">
        {{ loading ? "Loading..." : "Load Domains" }}
      </button>
    </div>

    <div v-if="domains.length > 0" class="domains-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Region</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="domain in domains" :key="domain.id">
            <td>{{ domain.name }}</td>
            <td>{{ domain.status }}</td>
            <td>{{ domain.region }}</td>
            <td>{{ domain.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <form class="form" @submit.prevent="createDomain">
      <h3>Create Domain</h3>
      <div class="field">
        <label for="domain">Domain Name</label>
        <input id="domain" v-model="newDomain" type="text" placeholder="example.com" required />
      </div>
      <div class="field">
        <label for="region">Region</label>
        <select id="region" v-model="region">
          <option value="us-east-1">us-east-1</option>
          <option value="eu-west-1">eu-west-1</option>
          <option value="sa-east-1">sa-east-1</option>
        </select>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Creating..." : "Create Domain" }}
      </button>
    </form>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// server/api/domains.get.js
const { data, error } = await resend.domains.list();
return { domains: data?.data || [] };

// server/api/domains.post.js
const { data, error } = await resend.domains.create({
  name: "example.com",
  region: "us-east-1",
});</code></pre>
    </div>
  </div>
</template>

<style scoped>
.section {
  margin-bottom: 1.5rem;
}

.section h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.form {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form h3 {
  font-size: 1rem;
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
.field select {
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

.domains-list {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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
