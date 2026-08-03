<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import {
  fetchFiveDayForecast,
  fetchWeatherByLocation,
  fetchWeatherList,
  WEATHER_LOCATIONS,
} from '@/services/weatherApi'
import { useConfigStore } from '@/stores/configStore'
import { createDebugLogger } from '@/utils/debugLogger'

import BaseDashboardCard from './BaseDashboardCard.vue'
import LocationSearchPanel from './LocationSearchPanel.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherComparisonChart from './WeatherComparisonChart.vue'
import WeatherForecastPanel from './WeatherForecastPanel.vue'

const router = useRouter()
const configStore = useConfigStore()
const logger = createDebugLogger('WeatherParent')

const customLocationStorageKey = 'skala-weather-custom-locations'
const favoriteStorageKey = 'skala-weather-favorite-city-ids'

const weatherList = ref([])
const customLocations = ref([])
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const selectedMapCityId = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const locationErrorMessage = ref('')
const lastUpdated = ref(null)
const sortMode = ref('default')
const forecastList = ref([])
const isForecastLoading = ref(false)
const forecastErrorMessage = ref('')
let forecastRequestId = 0

const readStorageArray = (storageKey) => {
  try {
    const savedValue = localStorage.getItem(storageKey)
    const parsedValue = savedValue ? JSON.parse(savedValue) : []

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (error) {
    console.warn(`[storage] ${storageKey}를 읽지 못했습니다.`, error)
    return []
  }
}

customLocations.value = readStorageArray(customLocationStorageKey)
const favoriteCityIds = ref(readStorageArray(favoriteStorageKey))

logger.state('대시보드 초기 상태 확인', {
  customLocationCount: customLocations.value.length,
  favoriteCount: favoriteCityIds.value.length,
})

const locationList = computed(() => {
  return [...WEATHER_LOCATIONS, ...customLocations.value]
})

const favoriteCount = computed(() => favoriteCityIds.value.length)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  const searchedCities = query
    ? weatherList.value.filter((city) => {
        const searchableText = [
          city.name,
          city.displayName,
          city.city,
          city.district,
          city.dong,
        ]
          .filter(Boolean)
          .join(' ')

        return searchableText.includes(query)
      })
    : weatherList.value

  if (sortMode.value === 'temp-desc') {
    return [...searchedCities].sort((first, second) => second.temp - first.temp)
  }

  if (sortMode.value === 'temp-asc') {
    return [...searchedCities].sort((first, second) => first.temp - second.temp)
  }

  return searchedCities
})

const mapCityId = computed(() => {
  return (
    selectedMapCityId.value ||
    locationList.value[0]?.id ||
    ''
  )
})

const lastUpdatedText = computed(() => {
  return lastUpdated.value
    ? lastUpdated.value.toLocaleString('ko-KR')
    : '아직 조회하지 않음'
})

const selectedDisplayTemp = computed(() => {
  const rawTemp = selectedCityInfo.value?.temp

  if (rawTemp === undefined) {
    return null
  }

  return configStore.unit === 'fahrenheit'
    ? Math.round((rawTemp * 9) / 5 + 32)
    : rawTemp
})

const statusBarMessage = computed(() => {
  return selectedCityInfo.value
    ? `${selectedCityInfo.value.name}이 선택되었습니다.`
    : '카드를 선택하면 선택한 도시 정보가 표시됩니다.'
})

const forecastCity = computed(() => {
  return selectedCityInfo.value ?? weatherList.value[0] ?? null
})

watch(selectedCityInfo, (newCity, oldCity) => {
  console.groupCollapsed('[watch] 선택 도시 변경')
  console.log('이전 도시:', oldCity?.name ?? '없음')
  console.log('현재 도시:', newCity?.name ?? '없음')
  console.log('도시 ID:', newCity?.id ?? '없음')
  console.log('시/구/동:', {
    city: newCity?.city,
    district: newCity?.district,
    dong: newCity?.dong,
  })
  console.log('날씨 상태:', newCity?.status ?? '없음')
  console.log('현재 온도:', newCity?.temp ?? '없음')
  console.log('상태바 문구:', statusBarMessage.value)
  console.groupEnd()
})

watch(
  customLocations,
  (newLocations) => {
    try {
      localStorage.setItem(
        customLocationStorageKey,
        JSON.stringify(newLocations),
      )
      console.info('[location] 사용자 지역 저장 완료:', newLocations)
    } catch (error) {
      console.warn('[location] 사용자 지역을 저장하지 못했습니다.', error)
    }
  },
  { deep: true },
)

watch(
  favoriteCityIds,
  (newFavorites) => {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify(newFavorites))
    } catch (error) {
      console.warn('[favorite] 즐겨찾기를 저장하지 못했습니다.', error)
    }
  },
  { deep: true },
)

watchEffect(() => {
  const query = searchQuery.value.trim()
  const results = filteredWeatherList.value

  console.groupCollapsed('[watchEffect] 검색 상태 변화')
  console.log('입력한 검색어:', searchQuery.value || '없음')
  console.log('전체 지역 수:', locationList.value.length)
  console.log('날씨 데이터 수:', weatherList.value.length)
  console.log('검색 결과 수:', results.length)
  console.log('정렬 방식:', sortMode.value)
  console.log('검색 결과:', results.map((city) => `${city.id} - ${city.name}`))
  console.log('검색 결과 없음:', Boolean(query) && results.length === 0)
  console.groupEnd()
})

const loadForecast = async (city) => {
  const requestId = ++forecastRequestId

  if (!city) {
    forecastList.value = []
    forecastErrorMessage.value = ''
    isForecastLoading.value = false
    logger.state('5일 예보 대상 지역 없음')
    return
  }

  isForecastLoading.value = true
  forecastErrorMessage.value = ''
  logger.input('5일 예보 갱신 요청', {
    cityId: city.id,
    name: city.name,
  })

  try {
    const forecasts = await fetchFiveDayForecast(city)

    if (requestId !== forecastRequestId) {
      logger.warn('오래된 5일 예보 응답을 무시했습니다.', { cityId: city.id })
      return
    }

    forecastList.value = forecasts
    logger.success('5일 예보 화면 갱신 완료', {
      cityId: city.id,
      dayCount: forecasts.length,
    })
  } catch (error) {
    if (requestId !== forecastRequestId) {
      return
    }

    logger.error('5일 예보 화면 갱신 실패', error, {
      cityId: city.id,
      name: city.name,
    })
    forecastList.value = []
    forecastErrorMessage.value =
      '5일 예보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    if (requestId === forecastRequestId) {
      isForecastLoading.value = false
    }
  }
}

const loadWeatherList = async () => {
  const selectedCityId = selectedCityInfo.value?.id

  isLoading.value = true
  errorMessage.value = ''
  logger.input('날씨 새로고침 요청', {
    locationCount: locationList.value.length,
    locationIds: locationList.value.map((location) => location.id),
    selectedCityId: selectedCityId ?? '없음',
  })
  console.info('[Axios] 전체 지역 날씨 요청 시작', {
    count: locationList.value.length,
    selectedCityId: selectedCityId ?? '없음',
  })

  try {
    const result = await fetchWeatherList(locationList.value)
    weatherList.value = result.weatherList
    lastUpdated.value = new Date()

    if (result.failedLocations.length > 0) {
      errorMessage.value = `일부 지역을 불러오지 못했습니다: ${result.failedLocations
        .map(({ location }) => location.name)
        .join(', ')}`
    }

    if (selectedCityId) {
      selectedCityInfo.value =
        result.weatherList.find((city) => city.id === selectedCityId) ?? null
    }

    loadForecast(selectedCityInfo.value ?? result.weatherList[0] ?? null)

    console.info('[Axios] 전체 지역 날씨 수신 완료', {
      successCount: result.weatherList.length,
      failedCount: result.failedLocations.length,
      lastUpdated: lastUpdated.value.toISOString(),
    })
    logger.success('대시보드 날씨 데이터 갱신 완료', {
      successCount: result.weatherList.length,
      failedCount: result.failedLocations.length,
    })
  } catch (error) {
    console.error('[Axios] 전체 지역 날씨 요청 실패:', error)
    logger.error('대시보드 날씨 데이터 갱신 실패', error)
    weatherList.value = []
    selectedCityInfo.value = null
    loadForecast(null)
    errorMessage.value =
      '실시간 날씨를 불러오지 못했습니다. API 키와 네트워크를 확인해주세요.'
  } finally {
    isLoading.value = false
    logger.state('날씨 로딩 상태 변경', { isLoading: false })
  }
}

const addLocation = async (location) => {
  logger.input('사용자 지역 추가 요청', {
    id: location.id,
    name: location.name,
    lat: location.lat,
    lon: location.lon,
  })
  const isDuplicate = locationList.value.some(
    (savedLocation) => savedLocation.id === location.id,
  )

  if (isDuplicate) {
    locationErrorMessage.value = '이미 추가된 지역입니다.'
    logger.warn('이미 등록된 지역입니다.', { id: location.id })
    return
  }

  locationErrorMessage.value = ''

  try {
    const weather = await fetchWeatherByLocation(location)
    customLocations.value = [...customLocations.value, location]
    weatherList.value = [...weatherList.value, weather]
    selectedCityInfo.value = weather
    selectedMapCityId.value = weather.id
    loadForecast(weather)
    lastUpdated.value = new Date()
    locationErrorMessage.value = `${location.name} 날씨를 추가했습니다.`
    logger.success('사용자 지역 추가 완료', {
      id: location.id,
      name: location.name,
      weatherCount: weatherList.value.length,
    })
  } catch (error) {
    console.error('[Axios] 추가 지역 날씨 요청 실패:', error)
    logger.error('사용자 지역 날씨 조회 실패', error, {
      id: location.id,
      name: location.name,
    })
    locationErrorMessage.value = `${location.name}의 날씨를 불러오지 못했습니다.`
  }
}

const isCustomLocation = (cityId) => {
  return customLocations.value.some((location) => location.id === cityId)
}

const removeLocation = (cityId) => {
  logger.input('사용자 지역 삭제 요청', { cityId })
  const location = customLocations.value.find((item) => item.id === cityId)

  if (!location) {
    logger.warn('삭제할 사용자 지역을 찾지 못했습니다.', { cityId })
    return
  }

  if (!window.confirm(`${location.name} 지역을 삭제할까요?`)) {
    logger.state('사용자 지역 삭제 취소', { cityId })
    return
  }

  customLocations.value = customLocations.value.filter(
    (item) => item.id !== cityId,
  )
  weatherList.value = weatherList.value.filter((city) => city.id !== cityId)
  favoriteCityIds.value = favoriteCityIds.value.filter(
    (favoriteId) => favoriteId !== cityId,
  )

  if (selectedCityInfo.value?.id === cityId) {
    selectedCityInfo.value = null
    loadForecast(weatherList.value[0] ?? null)
  }

  if (selectedMapCityId.value === cityId) {
    selectedMapCityId.value = ''
  }

  locationErrorMessage.value = `${location.name} 지역을 삭제했습니다.`
  logger.success('사용자 지역 삭제 완료', {
    cityId,
    remainingCustomLocationCount: customLocations.value.length,
  })
}

const resetCustomLocations = () => {
  logger.input('사용자 지역 전체 초기화 요청', {
    customLocationCount: customLocations.value.length,
  })
  if (customLocations.value.length === 0) {
    locationErrorMessage.value = '초기화할 추가 지역이 없습니다.'
    logger.warn('초기화할 사용자 지역이 없습니다.')
    return
  }

  if (!window.confirm('추가한 지역을 모두 삭제할까요?')) {
    logger.state('사용자 지역 전체 초기화 취소')
    return
  }

  const customLocationIds = new Set(
    customLocations.value.map((location) => location.id),
  )

  customLocations.value = []
  weatherList.value = weatherList.value.filter(
    (city) => !customLocationIds.has(city.id),
  )
  favoriteCityIds.value = favoriteCityIds.value.filter(
    (favoriteId) => !customLocationIds.has(favoriteId),
  )

  if (selectedCityInfo.value && customLocationIds.has(selectedCityInfo.value.id)) {
    selectedCityInfo.value = null
    loadForecast(weatherList.value[0] ?? null)
  }

  if (customLocationIds.has(selectedMapCityId.value)) {
    selectedMapCityId.value = ''
  }

  locationErrorMessage.value = '추가한 지역을 모두 초기화했습니다.'
  logger.success('사용자 지역 전체 초기화 완료', {
    removedCount: customLocationIds.size,
  })
}

const updateSearchQuery = (query) => {
  logger.input('도시 검색어 전달 수신', {
    query,
    queryLength: query.trim().length,
  })
  searchQuery.value = query
}

const selectCity = (city) => {
  logger.input('날씨 카드 선택 수신', {
    id: city.id,
    name: city.name,
  })
  selectedCityInfo.value = city
  loadForecast(city)
  logger.success('날씨 카드 선택 상태만 변경했습니다. 지도 선택 상태는 유지합니다.', {
    weatherCityId: city.id,
    mapCityId: selectedMapCityId.value || '없음',
  })
}

const selectMapCity = (cityId) => {
  logger.input('지도 지역 선택 수신', { cityId })
  selectedMapCityId.value = cityId
  logger.success('지도 위치만 변경했습니다. 날씨 선택 상태는 유지합니다.', {
    cityId,
    selectedWeatherCityId: selectedCityInfo.value?.id ?? '없음',
  })
}

const isFavorite = (cityId) => favoriteCityIds.value.includes(cityId)

const toggleFavorite = (cityId) => {
  const wasFavorite = isFavorite(cityId)
  favoriteCityIds.value = isFavorite(cityId)
    ? favoriteCityIds.value.filter((favoriteId) => favoriteId !== cityId)
    : [...favoriteCityIds.value, cityId]
  logger.success('즐겨찾기 상태 변경 완료', {
    cityId,
    isFavorite: !wasFavorite,
    favoriteCount: favoriteCityIds.value.length,
  })
}

const goToDetail = async (cityId) => {
  logger.input('상세 날씨 페이지 이동 요청', { cityId })

  try {
    await router.push(`/weather/${cityId}`)
    logger.success('상세 날씨 페이지 이동 완료', { cityId })
  } catch (error) {
    logger.error('상세 날씨 페이지 이동 실패', error, { cityId })
  }
}

onMounted(() => {
  logger.state('대시보드 마운트 완료')
  loadWeatherList()
})
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <LocationSearchPanel
        :locations="locationList"
        :selected-city-id="mapCityId"
        @add-location="addLocation"
        @select-city="selectMapCity"
      />

      <div class="location-actions">
        <span>추가 지역 {{ customLocations.length }}개</span>
        <button
          type="button"
          :disabled="customLocations.length === 0"
          @click="resetCustomLocations"
        >
          추가 지역 초기화
        </button>
      </div>

      <p
        v-if="locationErrorMessage"
        class="location-message"
      >
        {{ locationErrorMessage }}
      </p>

    </BaseDashboardCard>

    <BaseDashboardCard>
      <div class="dashboard-columns">
        <section class="weather-overview">
          <div class="weather-search-bar">
            <SearchBar
              :current-query="searchQuery"
              @update-query="updateSearchQuery"
            />
          </div>

          <div class="list-heading">
            <div>
              <h1>🏙️ 지역별 날씨 현황</h1>
              <p class="list-caption">주소 검색으로 원하는 지역을 계속 추가할 수 있습니다.</p>
            </div>
            <p>{{ filteredWeatherList.length }}개 도시</p>
          </div>

          <div class="weather-toolbar">
            <label class="sort-control">
              기온순 정렬
              <select v-model="sortMode">
                <option value="default">기본 순서</option>
                <option value="temp-desc">높은 기온순</option>
                <option value="temp-asc">낮은 기온순</option>
              </select>
            </label>

            <button
              type="button"
              class="refresh-button"
              :disabled="isLoading"
              @click="loadWeatherList"
            >
              {{ isLoading ? '불러오는 중...' : '↻ 날씨 새로고침' }}
            </button>

            <div class="dashboard-meta">
              <span>즐겨찾기 {{ favoriteCount }}개</span>
              <span>마지막 조회: {{ lastUpdatedText }}</span>
            </div>
          </div>

          <p
            v-if="isLoading"
            class="loading-message"
          >
            Axios로 모든 지역의 실시간 날씨를 불러오는 중입니다...
          </p>

          <p
            v-if="errorMessage"
            class="api-message"
          >
            {{ errorMessage }}
          </p>

          <div
            v-if="!isLoading && filteredWeatherList.length > 0"
            class="weather-grid"
          >
            <WeatherCard
              v-for="city in filteredWeatherList"
              :key="city.id"
              :city-item="city"
              :is-selected="selectedCityInfo?.id === city.id"
              :is-favorite="isFavorite(city.id)"
              :is-custom-location="isCustomLocation(city.id)"
              @select-card="selectCity"
              @click-detail="goToDetail"
              @toggle-favorite="toggleFavorite"
              @remove-location="removeLocation"
            />
          </div>

          <p
            v-else-if="!isLoading && !errorMessage"
            class="empty-message"
          >
            '{{ searchQuery }}'와 일치하는 도시가 없습니다.
          </p>
        </section>

        <WeatherComparisonChart :cities="filteredWeatherList" />
      </div>

      <section class="status-bar" aria-live="polite">
        <template v-if="selectedCityInfo">
          <strong>{{ statusBarMessage }}</strong>
          <span>
            현재 {{ selectedDisplayTemp }}{{ configStore.unitSymbol }}, 날씨는
            {{ selectedCityInfo.status }}입니다.
          </span>
          <small>{{ selectedCityInfo.displayName }}</small>
        </template>
        <span v-else>{{ statusBarMessage }}</span>
      </section>

      <WeatherForecastPanel
        :city="forecastCity"
        :forecasts="forecastList"
        :is-loading="isForecastLoading"
        :error-message="forecastErrorMessage"
      />
    </BaseDashboardCard>

  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.location-message {
  margin: 12px 0 0;
  color: #166534;
  font-weight: 700;
}

.weather-search-bar {
  margin-top: 20px;
}

.location-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  color: #64748b;
  font-size: 0.9rem;
}

.location-actions button {
  padding: 8px 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  font-weight: 700;
  cursor: pointer;
}

.location-actions button:hover:not(:disabled) {
  background: #ffe4e6;
}

.location-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  align-items: start;
  gap: 24px;
}

.weather-overview {
  min-width: 0;
}

.weather-toolbar {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: end;
  gap: 12px;
  margin-bottom: 18px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.sort-control {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
}

.sort-control select {
  min-width: 150px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
}

.refresh-button {
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.refresh-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.dashboard-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 14px;
  min-height: 40px;
  align-items: center;
  color: #64748b;
  font-size: 0.85rem;
  text-align: right;
}

.list-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.list-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.list-heading p {
  margin: 0;
  color: #64748b;
}

.list-heading .list-caption {
  margin-top: 6px;
  font-size: 0.9rem;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.empty-message {
  margin: 0;
  padding: 24px;
  border: 1px dashed #94a3b8;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  text-align: center;
}

.loading-message,
.api-message {
  margin: 0 0 16px;
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

.status-bar {
  display: grid;
  gap: 8px;
  min-height: 24px;
  margin-top: 24px;
  padding: 18px 20px;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: #f0fdf4;
  color: #166534;
  line-height: 1.5;
  text-align: center;
}

.status-bar strong {
  color: #14532d;
}

.status-bar small {
  display: block;
  overflow-wrap: anywhere;
  color: #64748b;
}

@media (max-width: 900px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }

  .weather-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-meta {
    grid-column: 1 / -1;
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 760px) {
  .weather-grid {
    grid-template-columns: 1fr;
  }

  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .weather-toolbar {
    grid-template-columns: 1fr;
  }

  .dashboard-meta {
    grid-column: auto;
  }
}
</style>
