<script setup>
const apiKeys = ref([]);
const newKeyName = ref("");
const permission = ref("full_access");
const renameId = ref("");
const renameName = ref("");
const loading = ref(false);
const success = ref(null);
const error = ref(null);

async function loadApiKeys() {
  loading.value = true;
  error.value = null;

  try {
    const data = await $fetch("/api/api-keys");
    apiKeys.value = data.apiKeys;
    success.value = `Found ${data.apiKeys.length} API key(s)`;
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to load API keys";
  } finally {
    loading.value = false;
  }
}

async function createApiKey() {
  if (!newKeyName.value) return;

  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    const data = await $fetch("/api/api-keys", {
      method: "POST",
      body: { name: newKeyName.value, permission: permission.value },
    });
    success.value = `API key created: ${data.apiKey?.name} (Token: ${data.apiKey?.token}) — copy this now, it won't be shown again`;
    newKeyName.value = "";
    await loadApiKeys();
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to create API key";
  } finally {
    loading.value = false;
  }
}

async function renameApiKey() {
  if (!renameId.value || !renameName.value) return;

  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    const data = await $fetch(`/api/api-keys/${renameId.value}`, {
      method: "PATCH",
      body: { name: renameName.value },
    });
    success.value = `API key renamed to: ${data.apiKey?.name}`;
    renameId.value = "";
    renameName.value = "";
    await loadApiKeys();
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to rename API key";
  } finally {
    loading.value = false;
  }
}

async function deleteApiKey(id) {
  loading.value = true;
  success.value = null;
  error.value = null;

  try {
    await $fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    success.value = "API key deleted";
    await loadApiKeys();
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to delete API key";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="API Keys"
      description="Manage API keys with Resend."
    />

    <div class="section">
      <h3>List API Keys</h3>
      <button :disabled="loading" @click="loadApiKeys">
        {{ loading ? "Loading..." : "Load API Keys" }}
      </button>
    </div>

    <div v-if="apiKeys.length > 0" class="api-keys-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apiKey in apiKeys" :key="apiKey.id">
            <td>{{ apiKey.name }}</td>
            <td>{{ apiKey.created_at }}</td>
            <td class="actions-cell">
              <button type="button" class="secondary" @click="renameId = apiKey.id">
                Rename
              </button>
              <button
                type="button"
                class="danger"
                :disabled="loading"
                @click="deleteApiKey(apiKey.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <form class="form" @submit.prevent="createApiKey">
      <h3>Create API Key</h3>
      <div class="field">
        <label for="key-name">Name</label>
        <input id="key-name" v-model="newKeyName" type="text" placeholder="My API Key" required />
      </div>
      <div class="field">
        <label for="permission">Permission</label>
        <select id="permission" v-model="permission">
          <option value="full_access">full_access</option>
          <option value="sending_access">sending_access</option>
        </select>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Creating..." : "Create API Key" }}
      </button>
    </form>

    <form class="form" @submit.prevent="renameApiKey">
      <h3>Rename API Key</h3>
      <div class="field">
        <label for="rename-id">API Key ID</label>
        <input id="rename-id" v-model="renameId" type="text" placeholder="API key ID" required />
      </div>
      <div class="field">
        <label for="rename-name">New Name</label>
        <input id="rename-name" v-model="renameName" type="text" placeholder="New name" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Renaming..." : "Rename API Key" }}
      </button>
    </form>

    <ResultDisplay :loading="loading" :success="success" :error="error" />

    <div class="code-example">
      <h3>Code Example</h3>
      <pre><code>// server/api/api-keys/index.get.js
const { data, error } = await resend.apiKeys.list();
return { apiKeys: data?.data || [] };

// server/api/api-keys/index.post.js
const { data, error } = await resend.apiKeys.create({
  name: "My API Key",
  permission: "full_access",
});

// server/api/api-keys/[id].patch.js
const { data, error } = await resend.apiKeys.update(id, { name: "New Name" });

// server/api/api-keys/[id].delete.js
const { data, error } = await resend.apiKeys.remove(id);</code></pre>
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

button.secondary {
  background: #f4f4f5;
  color: #18181b;
  border: 1px solid #d4d4d8;
}

button.danger {
  background: #dc2626;
  color: #fff;
}

.api-keys-list {
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

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.actions-cell button {
  padding: 0.375rem 0.75rem;
  align-self: auto;
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
