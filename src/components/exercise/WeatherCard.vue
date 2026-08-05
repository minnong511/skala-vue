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
  <el-card
    class="weather-card"
    shadow="hover"
    :class="{
      selected: props.isSelected,
      'has-remove-button': props.isCustomLocation,
    }"
    @click="selectCard"
  >
    <el-button
      v-if="props.isCustomLocation"
      type="button"
      class="remove-button"
      aria-label="추가 지역 삭제"
      circle
      @click.stop="removeLocation"
    >
      ×
    </el-button>

    <el-button
      text
      circle
      class="favorite-button"
      :class="{ active: props.isFavorite }"
      :aria-label="`${props.cityItem.name} 즐겨찾기 ${props.isFavorite ? '해제' : '추가'}`"
      @click.stop="toggleFavorite"
    >
      {{ props.isFavorite ? '★' : '☆' }}
    </el-button>

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

      <el-tag
        v-if="props.cityItem.temp >= 25"
        class="badge hot"
        round
      >
        🔥 더움
      </el-tag>
      <el-tag
        v-else
        class="badge cool"
        round
      >
        ❄️ 선선함
      </el-tag>
    </div>

    <el-button
      type="primary"
      round
      class="btn-detail"
      @click.stop="showDetail"
    >
      상세보기
    </el-button>

  </el-card>
</template>

<style scoped>
.weather-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 78%);
  border-radius: 14px;
  background: rgb(255 255 255 / 62%);
  box-shadow: 0 12px 28px rgb(30 64 175 / 9%);
  backdrop-filter: blur(14px) saturate(130%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover,
.weather-card.selected {
  border-color: rgb(96 165 250 / 78%);
  box-shadow: 0 16px 32px rgb(37 99 235 / 18%);
}

.weather-card:hover {
  transform: translateY(-2px);
}

.weather-card.selected {
  background: rgb(219 234 254 / 66%);
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
  color: #64748b;
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
  color: #7c3aed;
  text-shadow: 0 0 12px rgb(124 58 237 / 42%);
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
  background: rgb(254 215 170 / 78%);
  color: #c2410c;
}

.cool {
  background: rgb(207 250 254 / 78%);
  color: #0e7490;
}

.btn-detail {
  width: 100%;
  margin-top: auto;
  padding: 10px 14px;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 8px;
  background: #4f46e5;
  box-shadow: 0 8px 18px rgb(37 99 235 / 24%);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.btn-detail:hover {
  background: #4338ca;
}

.weather-card {
  overflow: hidden;
  border-radius: 20px;
  padding: 0;
  background: var(--glass-surface);
  box-shadow: 0 16px 36px rgb(30 64 175 / 12%);
}

.weather-card :deep(.el-card__body) {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  padding: 20px;
}

.weather-card::before {
  position: absolute;
  inset: -35% 35% auto -20%;
  height: 150px;
  border-radius: 50%;
  background: rgb(125 211 252 / 14%);
  content: '';
  pointer-events: none;
}

.card-heading,
.location-detail,
.temperature-row,
.btn-detail {
  position: relative;
  z-index: 1;
}

.favorite-button,
.remove-button {
  z-index: 2;
}

.temperature {
  letter-spacing: -0.06em;
  text-shadow: 0 6px 20px rgb(37 99 235 / 18%);
}

</style>
