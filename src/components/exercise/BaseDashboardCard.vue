<template>
  <el-card
    class="base-dashboard-card"
    shadow="never"
  >
    <slot />
  </el-card>
</template>

<style scoped>
.base-dashboard-card {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  background: var(--glass-surface);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-blur);
}

.base-dashboard-card :deep(.el-card__body) {
  padding: 0;
}

@media (max-width: 640px) {
  .base-dashboard-card {
    padding: 16px;
    border-radius: 20px;
  }
}
</style>
