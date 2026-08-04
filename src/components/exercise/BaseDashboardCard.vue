<template>
  <section class="base-dashboard-card">
    <slot />
  </section>
</template>

<style scoped>
.base-dashboard-card {
  margin-bottom: 20px;
  padding: 28px;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 68%), rgb(255 255 255 / 34%)),
    var(--glass-surface);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-blur);
}

@media (max-width: 640px) {
  .base-dashboard-card {
    padding: 20px;
    border-radius: 20px;
  }
}
</style>
