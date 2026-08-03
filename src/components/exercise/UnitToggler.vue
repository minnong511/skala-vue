<script setup>
import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'

const configStore = useConfigStore()
const logger = createDebugLogger('UnitToggler')

const toggleUnit = () => {
  logger.input('온도 단위 변경 버튼 클릭', {
    currentUnit: configStore.unit,
  })
  configStore.toggleUnit()
}
</script>

<template>
  <div class="unit-toggler">
    <span>
      현재 단위:
      <strong>{{ configStore.unitSymbol }}</strong>
    </span>
    <button
      type="button"
      class="toggle-btn"
      @click="toggleUnit"
    >
      {{ configStore.unit === 'celsius' ? '화씨로 보기' : '섭씨로 보기' }}
    </button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  color: #475569;
  font-size: 0.9rem;
}

.unit-toggler strong {
  color: #1d4ed8;
}

.toggle-btn {
  padding: 8px 12px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  cursor: pointer;
}

.toggle-btn:hover {
  background: #dbeafe;
}
</style>
