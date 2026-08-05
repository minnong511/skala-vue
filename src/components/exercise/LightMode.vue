<script setup>
import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'

const configStore = useConfigStore()
const logger = createDebugLogger('LightMode')

const toggleTheme = () => {
  logger.input('화면 테마 변경 버튼 클릭', {
    currentTheme: configStore.theme,
  })
  configStore.toggleTheme()
}
</script>

<template>
  <div class="light-mode-control">
    <el-button
      round
      class="theme-toggle-button"
      :aria-label="configStore.isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'"
      @click="toggleTheme"
    >
      {{ configStore.isDarkMode ? '☀️ 라이트' : '🌙 다크' }}
    </el-button>
  </div>
</template>

<style scoped>
.light-mode-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1c1c1e;
  font-size: 0.9rem;
}

.theme-label {
  white-space: nowrap;
}

.theme-toggle-button {
  padding: 8px 12px;
  border: 1px solid rgb(142 142 147 / 28%);
  border-radius: 999px;
  background: #f2f2f7;
  color: #1c1c1e;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.theme-toggle-button:hover {
  background: #e5e5ea;
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle-button {
    transition: none;
  }
}
</style>
