<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #71717a;
  font-size: 1rem;
}
</style>
