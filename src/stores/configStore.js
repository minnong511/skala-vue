import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { createDebugLogger } from '@/utils/debugLogger'

export const useConfigStore = defineStore('config', () => {
  // 1. state: 단위를 저장하는 변수 (초기값은 'celsius')
  // 값은 오직 'celsius' 또는 'fahrenheit' 두 가지만 가집니다.
  const unit = ref('celsius')
  const logger = createDebugLogger('configStore')

  // 2. getters: 현재 단위 상태에 맞춰 화면에 뿌릴 기호(℃ / ℉)를 실시간 리턴
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })

  // 3. actions: 버튼 클릭 시 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
  function toggleUnit() {
    const previousUnit = unit.value
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
    logger.success('온도 단위 변경 완료', {
      previousUnit,
      unit: unit.value,
      unitSymbol: unitSymbol.value,
    })
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})
