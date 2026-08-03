<script setup>
import { computed } from 'vue'

import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'


//
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isCustomLocation: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'select-card',
  'click-detail',
  'toggle-favorite',
  'remove-location',
])
const configStore = useConfigStore()
const logger = createDebugLogger('WeatherCard')

const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})

const selectCard = () => {
  logger.input('날씨 카드 선택', {
    id: props.cityItem.id,
    name: props.cityItem.name,
  })
  emit('select-card', props.cityItem)
}

const showDetail = () => {
  logger.input('상세보기 요청', {
    id: props.cityItem.id,
    name: props.cityItem.name,
  })
  emit('click-detail', props.cityItem.id)
}

const toggleFavorite = () => {
  logger.input('즐겨찾기 변경 요청', {
    id: props.cityItem.id,
    name: props.cityItem.name,
    currentValue: props.isFavorite,
  })
  emit('toggle-favorite', props.cityItem.id)
}

const removeLocation = () => {
  logger.input('추가 지역 삭제 요청', {
    id: props.cityItem.id,
    name: props.cityItem.name,
  })
  emit('remove-location', props.cityItem.id)
}

</script>

<template>
  <article
    class="weather-card"
    :class="{
      selected: props.isSelected,
      'has-remove-button': props.isCustomLocation,
    }"
    @click="selectCard"
  >
    <button
      v-if="props.isCustomLocation"
      type="button"
      class="remove-button"
      aria-label="추가 지역 삭제"
      @click.stop="removeLocation"
    >
      ×
    </button>

    <button
      type="button"
      class="favorite-button"
      :class="{ active: props.isFavorite }"
      :aria-label="`${props.cityItem.name} 즐겨찾기 ${props.isFavorite ? '해제' : '추가'}`"
      @click.stop="toggleFavorite"
    >
      {{ props.isFavorite ? '★' : '☆' }}
    </button>

    <div class="card-heading">
      <h3>{{ props.cityItem.name }}</h3>
      <span class="weather-status">{{ props.cityItem.status }}</span>
    </div>

    <p class="location-detail">
      <template v-if="props.cityItem.district || props.cityItem.dong">
        {{ props.cityItem.city }}
        <span v-if="props.cityItem.district"> · {{ props.cityItem.district }}</span>
        <span v-if="props.cityItem.dong"> · {{ props.cityItem.dong }}</span>
      </template>
      <span v-else>&nbsp;</span>
    </p>

    <div class="temperature-row">
      <p class="temperature">
        {{ displayTemp }}{{ configStore.unitSymbol }}
      </p>

      <span
        v-if="props.cityItem.temp >= 25"
        class="badge hot"
      >
        🔥 더움
      </span>
      <span
        v-else
        class="badge cool"
      >
        ❄️ 선선함
      </span>
    </div>

    <button
      type="button"
      class="btn-detail"
      @click.stop="showDetail"
    >
      상세보기
    </button>

  </article>
</template>

<style scoped>
.weather-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover,
.weather-card.selected {
  border-color: #60a5fa;
  box-shadow: 0 8px 18px rgb(37 99 235 / 12%);
}

.weather-card:hover {
  transform: translateY(-2px);
}

.weather-card.selected {
  background: #eff6ff;
}

.card-heading {
  min-height: 78px;
  padding-right: 34px;
}

.has-remove-button .card-heading {
  padding-left: 34px;
}

.favorite-button {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
}

.remove-button {
  position: absolute;
  top: 18px;
  left: 16px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #fecaca;
  border-radius: 50%;
  background: #fff1f2;
  color: #be123c;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.remove-button:hover {
  background: #ffe4e6;
}

.favorite-button:hover,
.favorite-button.active {
  color: #f59e0b;
}

h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  word-break: keep-all;
}

.weather-status {
  display: block;
  margin-top: 7px;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.35;
  word-break: keep-all;
}

.location-detail {
  min-height: 20px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.4;
  word-break: keep-all;
}

.temperature-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 16px 0 12px;
}

.temperature {
  margin: 0;
  color: #1d4ed8;
  font-size: 2rem;
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.hot {
  background: #ffe4e6;
  color: #be123c;
}

.cool {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-detail {
  width: 100%;
  margin-top: auto;
  padding: 10px 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.btn-detail:hover {
  background: #1d4ed8;
}

</style>
