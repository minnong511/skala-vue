<script setup>
import { computed, watch } from 'vue'

import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'

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

const configStore = useConfigStore()
const logger = createDebugLogger('WeatherForecastPanel')

const displayTemp = (temperature) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temperature * 9) / 5 + 32)
  }

  return temperature
}

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

    <p
      v-if="props.isLoading"
      class="forecast-message loading"
    >
      Axios로 5일 예보를 불러오는 중입니다...
    </p>

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
