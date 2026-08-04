<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  fetchWeatherByLocation,
  getGoogleMapsEmbedUrl,
  WEATHER_LOCATIONS,
} from '@/services/weatherApi'
import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'
import { getWeatherTheme } from '@/utils/weatherTheme'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const logger = createDebugLogger('WeatherDetailView')

const cityData = ref(null)
const locationInfo = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const weatherTheme = computed(() => {
  return getWeatherTheme(cityData.value?.icon)
})

const readCustomLocations = () => {
  try {
    const savedLocations = localStorage.getItem('skala-weather-custom-locations')
    const parsedLocations = savedLocations ? JSON.parse(savedLocations) : []

    return Array.isArray(parsedLocations) ? parsedLocations : []
  } catch (error) {
    console.warn('[storage] 사용자 지역을 읽지 못했습니다.', error)
    return []
  }
}

const displayTemp = computed(() => {
  if (!cityData.value) {
    return '-'
  }

  if (configStore.unit === 'fahrenheit') {
    return Math.round((cityData.value.temp * 9) / 5 + 32)
  }

  return cityData.value.temp
})

const googleMapsEmbedUrl = computed(() => {
  return getGoogleMapsEmbedUrl(cityData.value ?? locationInfo.value)
})

onMounted(async () => {
  isLoading.value = true
  logger.input('상세 날씨 페이지 로딩 시작', {
    cityId: route.params.cityId,
    unit: configStore.unit,
  })

  try {
    const allLocations = [
      ...WEATHER_LOCATIONS,
      ...readCustomLocations(),
    ]
    locationInfo.value = allLocations.find(
      (location) => location.id === route.params.cityId,
    )

    if (!locationInfo.value) {
      throw new Error(`등록되지 않은 지역 코드입니다: ${route.params.cityId}`)
    }

    logger.state('상세 조회 지역 확인', {
      cityId: locationInfo.value.id,
      name: locationInfo.value.name,
      lat: locationInfo.value.lat,
      lon: locationInfo.value.lon,
    })

    cityData.value = await fetchWeatherByLocation(locationInfo.value)
    logger.success('상세 날씨 데이터 수신 완료', {
      cityId: cityData.value.id,
      name: cityData.value.name,
      temp: cityData.value.temp,
      humidity: cityData.value.humidity,
    })
  } catch (error) {
    console.error('[Axios] 상세 날씨 조회 실패:', error)
    logger.error('상세 날씨 조회 실패', error, {
      cityId: route.params.cityId,
    })
    cityData.value = null
    errorMessage.value =
      '실시간 상세 날씨를 불러오지 못했습니다. API 키와 네트워크를 확인해주세요.'
  } finally {
    isLoading.value = false
    logger.state('상세 페이지 로딩 상태 변경', { isLoading: false })
  }
})

const goHome = () => {
  logger.input('메인 대시보드 이동 요청')
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <div
    class="detail-container"
    :class="`weather-theme-${weatherTheme}`"
  >
    <div class="page-heading">
      <div>
        <p class="eyebrow">WEATHER DETAIL</p>
        <h1>지역별 상세 기상 관측 정보</h1>
      </div>
      <span class="unit-label">현재 단위: {{ configStore.unitSymbol }}</span>
    </div>

    <p
      v-if="isLoading"
      class="loading-message"
    >
      Axios로 상세 날씨를 불러오는 중입니다...
    </p>

    <p
      v-if="errorMessage"
      class="api-message"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="cityData"
      class="info-card"
    >
      <h2>📍 {{ cityData.name }}</h2>
      <p
        v-if="cityData.district || cityData.dong"
        class="location-detail"
      >
        {{ cityData.city }}
        <span v-if="cityData.district"> · {{ cityData.district }}</span>
        <span v-if="cityData.dong"> · {{ cityData.dong }}</span>
      </p>
      <dl>
        <div>
          <dt>현재 기온</dt>
          <dd>{{ displayTemp }}{{ configStore.unitSymbol }}</dd>
        </div>
        <div>
          <dt>기상 현황</dt>
          <dd>{{ cityData.status }}</dd>
        </div>
        <div>
          <dt>대기 습도</dt>
          <dd>{{ cityData.humidity }}</dd>
        </div>
        <div>
          <dt>현재 풍속</dt>
          <dd>{{ cityData.wind }}</dd>
        </div>
      </dl>

      <iframe
        class="map-frame"
        :src="googleMapsEmbedUrl"
        :title="`${cityData.name} Google Maps 지도`"
        loading="lazy"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>

    <div
      v-else
      class="not-found-message"
    >
      해당 지역의 상세 데이터가 없습니다.
    </div>

    <button
      type="button"
      class="back-btn"
      @click="goHome"
    >
      ← 메인 대시보드로 돌아가기
    </button>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(30 64 175 / 8%);
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.7rem;
}

.unit-label {
  padding: 7px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  white-space: nowrap;
}

.info-card {
  padding: 22px;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #f8fbff;
}

h2 {
  margin: 0 0 18px;
  color: #1e3a8a;
  font-size: 1.3rem;
}

.location-detail {
  margin: -8px 0 18px;
  color: #64748b;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

dl div {
  padding: 14px;
  border-radius: 10px;
  background: #ffffff;
}

dt {
  color: #64748b;
  font-size: 0.9rem;
}

dd {
  margin: 4px 0 0;
  color: #1e293b;
  font-size: 1.15rem;
  font-weight: 700;
}

.not-found-message {
  padding: 20px;
  border-radius: 10px;
  background: #fff7ed;
  color: #9a3412;
  text-align: center;
}

.map-frame {
  display: block;
  width: 100%;
  height: 320px;
  margin-top: 18px;
  border: 0;
  border-radius: 10px;
}

.loading-message,
.api-message {
  padding: 12px 14px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1e40af;
  text-align: center;
}

.api-message {
  background: #fff7ed;
  color: #9a3412;
}

.back-btn {
  margin-top: 22px;
  padding: 10px 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.back-btn:hover {
  background: #1d4ed8;
}

.detail-container {
  border-color: var(--glass-border);
  background: var(--glass-surface);
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-blur);
}

.unit-label,
.back-btn {
  border-color: rgb(255 255 255 / 52%);
  background: rgb(239 246 255 / 66%);
  box-shadow: 0 6px 14px rgb(37 99 235 / 10%);
  backdrop-filter: blur(10px);
}

.info-card {
  border-color: rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 54%);
  box-shadow: 0 12px 28px rgb(30 64 175 / 8%);
  backdrop-filter: blur(12px);
}

.detail-container {
  transition: background 0.6s ease;
}

.detail-container.weather-theme-default {
  background:
    linear-gradient(135deg, rgb(238 246 255 / 54%), rgb(244 240 255 / 54%)),
    var(--glass-surface);
}

.detail-container.weather-theme-clear {
  background:
    radial-gradient(circle at 86% 4%, rgb(250 204 21 / 34%), transparent 30%),
    linear-gradient(135deg, rgb(186 230 253 / 70%), rgb(239 246 255 / 54%) 58%),
    var(--glass-surface);
}

.detail-container.weather-theme-clouds {
  background:
    radial-gradient(circle at 18% 8%, rgb(226 232 240 / 66%), transparent 34%),
    linear-gradient(135deg, rgb(203 213 225 / 70%), rgb(239 246 255 / 56%) 58%),
    var(--glass-surface);
}

.detail-container.weather-theme-rain {
  background:
    radial-gradient(circle at 84% 10%, rgb(96 165 250 / 28%), transparent 30%),
    linear-gradient(135deg, rgb(147 197 253 / 70%), rgb(30 64 175 / 18%) 55%),
    var(--glass-surface);
}

.detail-container.weather-theme-storm {
  background:
    radial-gradient(circle at 78% 4%, rgb(129 140 248 / 36%), transparent 28%),
    linear-gradient(135deg, rgb(49 46 129 / 70%), rgb(67 56 202 / 42%) 58%),
    var(--glass-surface);
}

.detail-container.weather-theme-snow {
  background:
    radial-gradient(circle at 16% 6%, rgb(255 255 255 / 74%), transparent 28%),
    linear-gradient(135deg, rgb(224 242 254 / 76%), rgb(237 233 254 / 68%) 58%),
    var(--glass-surface);
}

.detail-container.weather-theme-mist {
  background:
    radial-gradient(circle at 72% 8%, rgb(203 213 225 / 52%), transparent 32%),
    linear-gradient(135deg, rgb(203 213 225 / 70%), rgb(226 232 240 / 62%) 58%),
    var(--glass-surface);
}

.detail-container {
  border-radius: 26px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 66%), rgb(255 255 255 / 34%)),
    var(--glass-surface);
}

.info-card {
  border-radius: 20px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 68%), rgb(255 255 255 / 34%)),
    var(--glass-surface);
}

dl div {
  border: 1px solid rgb(255 255 255 / 66%);
  background: rgb(255 255 255 / 46%);
  box-shadow: 0 8px 18px rgb(30 64 175 / 7%);
  backdrop-filter: blur(12px);
}

@media (prefers-reduced-motion: reduce) {
  .detail-container {
    transition: none;
  }
}

@media (max-width: 640px) {
  .detail-container {
    padding: 20px;
  }

  .page-heading {
    flex-direction: column;
  }

  dl {
    grid-template-columns: 1fr;
  }
}
</style>
