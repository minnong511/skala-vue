<!--
WeatherParent.vue
   ↓ props 전달
WeatherForecastPanel.vue
   ↓
도시 이름, 로딩 상태, 오류, 5일 예보 카드 출력


1. 부모에게서 props를 받음
2. 섭씨/화씨에 맞게 온도를 변환
3. 예보 데이터를 화면용 데이터로 가공
4. 로딩, 오류, 정상 데이터, 빈 상태를 구분해서 출력
5. 예보 데이터를 반복하여 카드로 표시

-->

<script setup>
import { computed, watch } from 'vue'

import { useConfigStore } from '@/stores/configStore'
// ConfigStore.unit, ConfigStore.unitSymbol -> 예상 형태
// Pinia에서 전역변수 써서 설정 정보를 가져온다.
// 'celsius' 또는 'fahrenheit'
// '℃' 또는 '℉' -> 이걸로 보여준다.


import { createDebugLogger } from '@/utils/debugLogger'
// 디버깅 로그를 출력하기 위한 사용자 정의 함수

// 현재 컴포넌트 내부에서 사용할 자식 컴포넌트를 가져온다.





// Initial 세팅
// props.city         // null
// props.forecasts    // []
// props.isLoading    // false
// props.errorMessage // ''
// defineProps는 부모 컴포넌트가 자식 컴포넌트에게 전달한 데이터를 받는 기능

// 예시
// city: {
//   type: Object,
//   default: null,
// },
// -->
// {
//   id: 'seoul',
//   name: '서울',
//   lat: 37.5665,
//   lon: 126.978,
// }

// forecasts: {
//   type: Array,
//   default: () => [],
// },
// [
//   {
//     id: '2026-08-04',
//     date: '2026-08-04',
//     dateLabel: '8월 4일',
//     status: '맑음',
//     tempMin: 24,
//     tempMax: 31,
//     humidity: 65,
//   },
// ]

// isLoading: {
//   type: Boolean,
//   default: false,
// },
// true  → API 요청 중
// false → API 요청 중 아님

// errorMessage: {
//   type: String,
//   default: '',
// },
// '5일 예보를 불러오지 못했습니다.'

const props = defineProps({
  city: {
    type: Object,
    default: null,
  },
  forecasts: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})
// 자식에서는 이름을 맘대로 지어서 받을 수도 있다.


// 불러온 함수 지정하기
const configStore = useConfigStore()
const logger = createDebugLogger('WeatherForecastPanel')


// 온도를 화면에 표시하기 전에 섭씨 또는 화씨로 변환하는 함수
const displayTemp = (temperature) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temperature * 9) / 5 + 32)
  }

  return temperature
}

// 
const displayForecasts = computed(() => {
  return props.forecasts.map((forecast) => ({
    ...forecast,
    displayMin: displayTemp(forecast.tempMin),
    displayMax: displayTemp(forecast.tempMax),
  }))
})

watch(
  () => props.city?.id,
  (cityId) => {
    logger.state('5일 예보 대상 도시 변경', {
      cityId: cityId ?? '없음',
      name: props.city?.name ?? '없음',
    })
  },
)

watch(
  () => props.forecasts,
  (forecasts) => {
    logger.state('5일 예보 화면 데이터 변경', {
      dayCount: forecasts.length,
      dates: forecasts.map((forecast) => forecast.date),
    })
  },
)
</script>

<template>
  <section class="forecast-panel">

    <!-- props.city가 있으면 도시 이름을 표시하고, 없으면 기본 문구를 표시 -->
    <div class="panel-heading">
      <div>
        <p class="eyebrow">5-DAY FORECAST</p>
        <h2>
          {{ props.city ? `${props.city.name} 5일 날씨` : '5일 날씨 예보' }}
        </h2>
      </div>
      <p class="description">
        {{ props.city ? '선택된 날씨 지역을 기준으로 표시합니다.' : '날씨 지역을 선택해주세요.' }}
      </p>
    </div>

    <!-- isLoading이 true면 로딩 문구를 표시-->
    <p
      v-if="props.isLoading"
      class="forecast-message loading"
    >
      Axios로 5일 예보를 불러오는 중입니다...
    </p>

    <!-- isLoading이 true면 로딩 문구를 표시 -->
    <p
      v-else-if="props.errorMessage"
      class="forecast-message error"
    >
      {{ props.errorMessage }}
    </p>

    <div
      v-else-if="displayForecasts.length > 0"
      class="forecast-grid"
    >
      <article
        v-for="forecast in displayForecasts"
        :key="forecast.id"
        class="forecast-card"
      >
        <p class="forecast-date">{{ forecast.dateLabel }}</p>
        <p class="forecast-status">{{ forecast.status }}</p>
        <div class="forecast-temperature">
          <strong>{{ forecast.displayMax }}{{ configStore.unitSymbol }}</strong>
          <span>최고</span>
          <strong>{{ forecast.displayMin }}{{ configStore.unitSymbol }}</strong>
          <span>최저</span>
        </div>
        <p class="forecast-humidity">평균 습도 {{ forecast.humidity }}%</p>
      </article>
    </div>

    <p
      v-else
      class="forecast-message empty"
    >
      표시할 5일 예보가 없습니다.
    </p>

  </section>

</template>

<!-- CSS는 일단 패스!-->

<style scoped>
.forecast-panel {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dbe4f0;
}

.panel-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.3rem;
}

.description {
  margin: 0;
  color: #64748b;
  text-align: right;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.forecast-card {
  min-width: 0;
  padding: 16px 14px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
}

.forecast-date,
.forecast-status,
.forecast-humidity {
  margin: 0;
}

.forecast-date {
  color: #1e3a8a;
  font-weight: 700;
}

.forecast-status {
  min-height: 40px;
  margin-top: 8px;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: keep-all;
}

.forecast-temperature {
  display: grid;
  grid-template-columns: auto auto;
  align-items: baseline;
  gap: 2px 6px;
  margin-top: 14px;
}

.forecast-temperature strong {
  color: #1d4ed8;
  font-size: 1.1rem;
}

.forecast-temperature span {
  color: #64748b;
  font-size: 0.75rem;
}

.forecast-humidity {
  margin-top: 12px;
  color: #64748b;
  font-size: 0.8rem;
}

.forecast-message {
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  text-align: center;
}

.forecast-message.loading {
  background: #eff6ff;
  color: #1e40af;
}

.forecast-message.error {
  background: #fff7ed;
  color: #9a3412;
}

@media (max-width: 1000px) {
  .forecast-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.forecast-card {
  border-color: rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 54%);
  box-shadow: 0 8px 18px rgb(30 64 175 / 7%);
  backdrop-filter: blur(12px);
}

.forecast-message {
  background: rgb(255 255 255 / 48%);
  backdrop-filter: blur(10px);
}

.forecast-message.loading {
  background: rgb(219 234 254 / 58%);
}

.forecast-message.error {
  background: rgb(255 237 213 / 64%);
}

.forecast-panel {
  border-top-color: rgb(255 255 255 / 64%);
}

.forecast-card {
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 66%), rgb(255 255 255 / 34%)),
    var(--glass-surface);
  box-shadow: 0 12px 26px rgb(30 64 175 / 8%);
}

@media (max-width: 640px) {
  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .description {
    text-align: left;
  }

  .forecast-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
