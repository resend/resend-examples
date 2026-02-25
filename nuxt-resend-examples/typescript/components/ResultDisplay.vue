<script setup lang="ts">
defineProps<{
  loading: boolean;
  success: string | null;
  error: string | null;
}>();
</script>

<template>
  <div class="result-display">
    <div v-if="loading" class="result loading">Sending...</div>
    <div v-if="success" class="result success">{{ success }}</div>
    <div v-if="error" class="result error">{{ error }}</div>
  </div>
</template>

<style scoped>
.result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.result.loading {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.result.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  white-space: pre-wrap;
}

.result.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
