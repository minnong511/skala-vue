<script setup>
import { computed, ref, watch } from 'vue'

import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'

const props = defineProps({
  cities: {
    type: Array,
    default: () => [],
  },
})

const metric = ref('temp')
const configStore = useConfigStore()
const logger = createDebugLogger('WeatherComparisonChart')

watch(metric, (newMetric, oldMetric) => {
  logger.input('비교 항목 변경', {
    previousMetric: oldMetric,
    metric: newMetric,
  })
})

watch(
  () => props.cities,
  (cities) => {
    logger.state('비교 대상 도시 변경', {
      cityCount: cities.length,
      cityIds: cities.map((city) => city.id),
    })
  },
)

const metricLabel = computed(() => {
  if (metric.value === 'humidity') {
    return '습도'
  }

  if (metric.value === 'wind') {
    return '풍속'
  }

  return '기온'
})

const metricUnit = computed(() => {
  if (metric.value === 'humidity') {
    return '%'
  }

  if (metric.value === 'wind') {
    return 'm/s'
  }

  return configStore.unitSymbol
})

const hasEnoughCities = computed(() => props.cities.length >= 2)

const chartRows = computed(() => {
  const rows = props.cities
    .map((city) => ({
      ...city,
      value:
        metric.value === 'humidity'
          ? city.humidity
          : metric.value === 'wind'
            ? city.wind
            : city.temp,
      displayValue:
        metric.value !== 'temp' || configStore.unit === 'celsius'
          ? metric.value === 'humidity'
            ? city.humidity
            : metric.value === 'wind'
              ? city.wind
              : city.temp
          : Math.round((city.temp * 9) / 5 + 32),
    }))
    .sort((first, second) => second.value - first.value)

  const maxValue = Math.max(...rows.map((city) => city.value), 0)

  return rows.map((city) => ({
    ...city,
    ratio: maxValue > 0 ? Math.max((city.value / maxValue) * 100, 4) : 0,
  }))
})

const highestCity = computed(() => chartRows.value[0] ?? null)
</script>

<template>
  <section class="comparison-panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">WEATHER COMPARISON</p>
        <h2>도시별 날씨 비교</h2>
      </div>
      <p class="description">막대가 길수록 현재 값이 높습니다.</p>
    </div>

    <div class="chart-controls">
      <label>
        비교 항목
        <select v-model="metric">
          <option value="temp">기온</option>
          <option value="humidity">습도</option>
          <option value="wind">풍속</option>
        </select>
      </label>

      <p class="selected-count">
        선택된 도시 {{ props.cities.length }}개
      </p>
    </div>

    <p
      v-if="hasEnoughCities && highestCity"
      class="comparison-summary"
    >
      현재 {{ metricLabel }}이 가장 높은 도시는
      <strong>{{ highestCity.name }}</strong>입니다.
    </p>

    <div
      v-if="hasEnoughCities && chartRows.length > 0"
      class="chart-list"
    >
      <div
        v-for="city in chartRows"
        :key="`${metric}-${city.id}`"
        class="chart-row"
      >
        <div class="chart-label">
          <strong>{{ city.name }}</strong>
          <span>{{ city.displayValue }}{{ metricUnit }}</span>
        </div>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ '--bar-width': `${city.ratio}%` }"
          ></div>
        </div>
      </div>
    </div>

    <p
      v-else
      class="empty-chart"
    >
      {{
        props.cities.length === 1
          ? '비교하려면 도시를 한 곳 더 선택해주세요.'
          : '비교할 도시를 2개 이상 선택해주세요.'
      }}
    </p>

  </section>
</template>

<style scoped>
.comparison-panel {
  height: 100%;
  margin-top: 0;
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(30 64 175 / 8%);
}

.panel-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
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
  font-size: 1.4rem;
}

.description {
  margin: 0;
  color: #64748b;
  text-align: right;
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
  margin-bottom: 18px;
}

.chart-controls label,
.selected-count {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
}

.selected-count {
  margin: 0;
  align-self: center;
}

.chart-controls select {
  min-width: 130px;
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
}

.comparison-summary {
  margin: 0 0 16px;
  color: #334155;
}

.comparison-summary strong {
  color: #1d4ed8;
}

.chart-list {
  display: grid;
  gap: 14px;
}

.chart-row {
  display: grid;
  gap: 7px;
}

.chart-label {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  color: #334155;
}

.chart-label strong {
  color: #0f172a;
  line-height: 1.35;
  word-break: keep-all;
}

.chart-label span {
  color: #1d4ed8;
  font-weight: 700;
}

.bar-track {
  height: 20px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.bar-fill {
  width: var(--bar-width);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
  animation: fill-bar 0.8s ease-out both;
}

@keyframes fill-bar {
  from {
    width: 0;
  }
  to {
    width: var(--bar-width);
  }
}

.empty-chart {
  margin: 0;
  padding: 20px;
  border: 1px dashed #94a3b8;
  border-radius: 10px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 640px) {
  .comparison-panel {
    padding: 20px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .description {
    text-align: left;
  }

  .chart-label {
    font-size: 0.9rem;
  }
}

.comparison-panel {
  border-color: var(--glass-border);
  background: var(--glass-surface-strong);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-blur);
}

.chart-controls select {
  border-color: rgb(148 163 184 / 38%);
  background: rgb(255 255 255 / 68%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
}

.bar-track {
  background: rgb(226 232 240 / 62%);
  box-shadow: inset 0 1px 3px rgb(30 64 175 / 8%);
}

.comparison-panel {
  border-radius: 24px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 70%), rgb(255 255 255 / 36%)),
    var(--glass-surface-strong);
}

.bar-fill {
  background: linear-gradient(90deg, #06b6d4, #3b82f6 54%, #6366f1);
  box-shadow: 0 0 18px rgb(59 130 246 / 38%);
}
</style>
