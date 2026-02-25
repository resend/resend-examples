<template>
  <div class="app">
    <nav class="nav">
      <NuxtLink to="/" class="nav-brand">Resend + Nuxt Examples</NuxtLink>
      <div class="nav-links">
        <NuxtLink to="/send-email">Send</NuxtLink>
        <NuxtLink to="/attachments">Attachments</NuxtLink>
        <NuxtLink to="/scheduling">Scheduling</NuxtLink>
        <NuxtLink to="/templates">Templates</NuxtLink>
        <NuxtLink to="/domains">Domains</NuxtLink>
        <NuxtLink to="/audiences">Audiences</NuxtLink>
      </div>
    </nav>
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: #f4f4f5;
  color: #18181b;
}

.app {
  min-height: 100vh;
}

.nav {
  background: #18181b;
  color: #fff;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #fff;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #fff;
}

.main {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
