import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 일단 main.js에서 불러온 pinia를 또 설정해준다..

import { createDebugLogger } from '@/utils/debugLogger'


// Convention이 있다.

export const useConfigStore = defineStore('config', () => {
  // 1. state: 단위를 저장하는 변수 (초기값은 'celsius')
  // 초기값을 설정할 수 있도록!
  // 값은 오직 'celsius' 또는 'fahrenheit' 두 가지만 가집니다.
  const unit = ref('celsius')
  // 라이트 모드, 다크 모드 전환용 전역 변수
  const theme = ref('light')
  const logger = createDebugLogger('configStore')

  // 2. getters: 현재 단위 상태에 맞춰 화면에 뿌릴 기호(℃ / ℉)를 실시간 리턴
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })
  // 바뀌면 dark_mode로 가게 만들어 놓았음. 
  const isDarkMode = computed(() => theme.value === 'dark')

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

  // light mode 전환 LightMode.vue
  function toggleTheme() {
    const previousTheme = theme.value
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    logger.success('화면 테마 변경 완료', {
      previousTheme,
      theme: theme.value,
    })
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
    theme,
    isDarkMode,
    toggleTheme,
  }
})
