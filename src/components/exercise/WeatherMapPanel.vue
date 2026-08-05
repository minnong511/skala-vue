<script setup>
import { computed, ref, watch } from 'vue'

import { getGoogleMapsEmbedUrl } from '@/services/weatherApi'
import { createDebugLogger } from '@/utils/debugLogger'

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
  selectedCityId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select-city'])
const logger = createDebugLogger('WeatherMapPanel')

const fallbackCityId = ref('')

const activeCityId = computed(() => {
  return props.selectedCityId || fallbackCityId.value || props.locations[0]?.id || ''
})

const selectedLocation = computed(() => {
  return props.locations.find(
    (location) => location.id === activeCityId.value,
  )
})

const selectedMapEmbedUrl = computed(() => {
  return getGoogleMapsEmbedUrl(selectedLocation.value)
})

watch(
  [activeCityId, selectedLocation],
  ([cityId, location], [oldCityId] = []) => {
    if (!location) {
      logger.warn('지도에 표시할 지역을 찾지 못했습니다.', { cityId })
      return
    }

    logger.state('지도 표시 지역 변경', {
      previousCityId: oldCityId ?? '없음',
      cityId,
      name: location.name,
      lat: location.lat,
      lon: location.lon,
    })
  },
)

const selectCity = (cityId) => {
  logger.input('지도 지역 선택', { cityId })
  fallbackCityId.value = cityId
  emit('select-city', cityId)
}
</script>

<template>
  <section class="map-panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">CITY LOCATION</p>
        <h2>도시 위치 지도</h2>
      </div>
      <p class="description">도시를 선택하면 해당 위치의 지도가 표시됩니다.</p>
    </div>

    <div class="city-tabs">
      <el-button
        v-for="location in props.locations"
        :key="location.id"
        round
        :class="{ active: activeCityId === location.id }"
        @click="selectCity(location.id)"
      >
        {{ location.name }}
      </el-button>
    </div>

    <div
      v-if="selectedLocation"
      class="location-summary"
    >
      <strong>📍 {{ selectedLocation.name }}</strong>
      <span>
        위도 {{ selectedLocation.lat }}, 경도 {{ selectedLocation.lon }}
      </span>
    </div>

    <iframe
      v-if="selectedLocation"
      class="map-frame"
      :src="selectedMapEmbedUrl"
      :title="`${selectedLocation.name} Google Maps 지도`"
      loading="lazy"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </section>
</template>

<style scoped>
.map-panel {
  margin-top: 20px;
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

.city-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.city-tabs button {
  padding: 9px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  cursor: pointer;
}

.city-tabs button.active,
.city-tabs button:hover {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.location-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  color: #475569;
}

.location-summary strong {
  color: #14532d;
}

.map-frame {
  display: block;
  width: 100%;
  height: 360px;
  border: 0;
  border-radius: 12px;
}

@media (max-width: 640px) {
  .map-panel {
    padding: 20px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .description {
    text-align: left;
  }

  .map-frame {
    height: 300px;
  }
}
</style>
