<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { searchLocations } from '@/services/locationApi'
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

const emit = defineEmits(['add-location', 'select-city'])
const logger = createDebugLogger('LocationSearchPanel')

const query = ref('')
const searchResults = ref([])
const selectedSearchLocationId = ref('')
const isSearching = ref(false)
const errorMessage = ref('')
let searchTimer

const selectedSearchLocation = computed(() => {
  return searchResults.value.find(
    (location) => location.id === selectedSearchLocationId.value,
  )
})

const selectedMapLocation = computed(() => {
  return props.locations.find(
    (location) => location.id === props.selectedCityId,
  ) ?? props.locations[0]
})

const runSearch = async () => {
  const trimmedQuery = query.value.trim()
  selectedSearchLocationId.value = ''

  logger.input('주소 검색 실행', {
    query: trimmedQuery,
    queryLength: trimmedQuery.length,
  })

  if (trimmedQuery.length < 2) {
    searchResults.value = []
    errorMessage.value = '두 글자 이상 입력해주세요.'
    logger.warn('검색어가 너무 짧습니다.', { minimumLength: 2 })
    return
  }

  isSearching.value = true
  errorMessage.value = ''
  logger.state('주소 검색 중', { query: trimmedQuery })

  try {
    searchResults.value = await searchLocations(trimmedQuery)
    logger.success('주소 검색 결과 수신', {
      resultCount: searchResults.value.length,
    })

    if (searchResults.value.length === 0) {
      errorMessage.value = '검색 결과가 없습니다. 다른 주소를 입력해보세요.'
      logger.warn('주소 검색 결과가 없습니다.', { query: trimmedQuery })
    }
  } catch (error) {
    logger.error('주소 검색 실패', error, { query: trimmedQuery })
    searchResults.value = []
    errorMessage.value = '지역 검색에 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isSearching.value = false
    logger.state('주소 검색 상태 변경', { isSearching: false })
  }
}

const scheduleSearch = () => {
  window.clearTimeout(searchTimer)
  errorMessage.value = ''
  selectedSearchLocationId.value = ''

  logger.input('주소 검색어 입력 감지', {
    query: query.value,
    queryLength: query.value.trim().length,
  })

  if (query.value.trim().length < 2) {
    searchResults.value = []
    return
  }

  searchTimer = window.setTimeout(runSearch, 450)
}

const addLocation = (location) => {
  selectedSearchLocationId.value = location.id
  logger.input('검색 결과 지역 추가 요청', {
    id: location.id,
    name: location.name,
    lat: location.lat,
    lon: location.lon,
  })
  emit('add-location', location)
}

const selectSearchLocation = (location) => {
  selectedSearchLocationId.value = location.id
  logger.input('검색 결과 주소 선택', {
    id: location.id,
    name: location.name,
    lat: location.lat,
    lon: location.lon,
  })
}

const selectMapCity = (cityId) => {
  selectedSearchLocationId.value = ''
  logger.input('기존 지역 지도 선택', { cityId })
  emit('select-city', cityId)
}

watch(
  () => props.selectedCityId,
  (cityId) => {
    if (cityId) {
      selectedSearchLocationId.value = ''
      logger.state('부모에서 선택한 지역으로 지도 동기화', { cityId })
    }
  },
)

watch(query, scheduleSearch)

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
  logger.state('컴포넌트 정리 완료')
})
</script>

<template>
  <section class="location-search-panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">ADD LOCATION</p>
        <h2>원하는 지역 추가</h2>
      </div>
      <p class="description">주소를 검색하면 시·구·동과 좌표를 찾아 날씨를 추가합니다.</p>
    </div>

    <form
      class="search-form"
      @submit.prevent="runSearch"
    >
      <label for="location-search">주소 검색</label>
      <div class="search-row">
        <input
          id="location-search"
          v-model="query"
          type="search"
          placeholder="예: 서울 강남구 역삼동"
        />
        <button
          type="submit"
          :disabled="isSearching"
        >
          {{ isSearching ? '검색 중...' : '지역 검색' }}
        </button>
      </div>
    </form>

    <p
      v-if="errorMessage"
      class="search-message"
    >
      {{ errorMessage }}
    </p>

    <ul
      v-if="searchResults.length > 0"
      class="result-list"
    >
      <li
        v-for="location in searchResults"
        :key="location.id"
        class="result-item"
      >
        <div class="result-content">
          <button
            type="button"
            class="result-location-button"
            :class="{ selected: selectedSearchLocationId === location.id }"
            @click="selectSearchLocation(location)"
          >
            <strong>{{ location.name }}</strong>
            <span>{{ location.displayName }}</span>
            <small>
              위도 {{ location.lat.toFixed(5) }}, 경도 {{ location.lon.toFixed(5) }}
            </small>
          </button>
          <button
            type="button"
            class="add-button"
            @click="addLocation(location)"
          >
            날씨 추가
          </button>
        </div>

        <div
          v-if="selectedSearchLocationId === location.id"
          class="search-map-preview"
        >
          <div class="map-preview-heading">
            <strong>📍 선택한 주소 위치 미리보기</strong>
            <span>지도를 클릭하지 않아도 검색 좌표를 확인할 수 있습니다.</span>
          </div>
          <iframe
            class="map-frame"
            :src="getGoogleMapsEmbedUrl(location)"
            :title="`${location.name} 검색 위치 지도`"
            loading="lazy"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </li>
    </ul>

    <section
      v-if="props.locations.length > 0 && !selectedSearchLocation"
      class="current-map-section"
    >
      <div class="map-heading">
        <div>
          <p class="eyebrow">CITY LOCATION</p>
          <h3>도시 위치 지도</h3>
        </div>
        <p>카드나 지역 탭을 선택하면 지도가 바뀝니다.</p>
      </div>

      <div class="city-tabs">
        <button
          v-for="location in props.locations"
          :key="location.id"
          type="button"
          :class="{ active: selectedMapLocation?.id === location.id }"
          @click="selectMapCity(location.id)"
        >
          {{ location.name }}
        </button>
      </div>

      <div
        v-if="selectedMapLocation"
        class="map-location-summary"
      >
        <strong>📍 {{ selectedMapLocation.name }}</strong>
        <span>
          위도 {{ selectedMapLocation.lat }}, 경도 {{ selectedMapLocation.lon }}
        </span>
      </div>

      <iframe
        v-if="selectedMapLocation"
        class="map-frame"
        :src="getGoogleMapsEmbedUrl(selectedMapLocation)"
        :title="`${selectedMapLocation.name} Google Maps 지도`"
        loading="lazy"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </section>
  </section>
</template>

<style scoped>
.location-search-panel {
  padding: 22px;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  background: #f8fbff;
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
  font-size: 1.25rem;
}

.description {
  margin: 0;
  color: #64748b;
  text-align: right;
}

.search-form {
  display: grid;
  gap: 8px;
}

.search-form label {
  color: #334155;
  font-weight: 700;
}

.search-row {
  display: flex;
  gap: 8px;
}

.search-row input {
  min-width: 0;
  flex: 1;
  padding: 11px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
}

.search-row button,
.add-button {
  padding: 10px 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.search-row button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.search-message {
  margin: 12px 0 0;
  color: #9a3412;
}

.result-list {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.result-item {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #ffffff;
}

.result-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.result-location-button {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.result-location-button.selected {
  outline: 2px solid #93c5fd;
  outline-offset: 6px;
  border-radius: 4px;
}

.result-location-button strong {
  color: #1e3a8a;
}

.result-location-button span,
.result-location-button small {
  overflow: hidden;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-location-button small {
  color: #475569;
}

.add-button {
  flex-shrink: 0;
}

.search-map-preview,
.current-map-section {
  padding-top: 12px;
  border-top: 1px solid #dbeafe;
}

.map-preview-heading,
.map-location-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  color: #475569;
}

.map-preview-heading strong,
.map-location-summary strong {
  color: #14532d;
}

.map-preview-heading span {
  font-size: 0.85rem;
}

.map-frame {
  display: block;
  width: 100%;
  height: 280px;
  border: 0;
  border-radius: 10px;
}

.current-map-section {
  margin-top: 18px;
}

.map-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.map-heading .eyebrow {
  margin-bottom: 5px;
}

.map-heading h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.map-heading > p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  text-align: right;
}

.city-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.city-tabs button {
  padding: 8px 12px;
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

.add-button:hover {
  background: #eff6ff;
}

@media (max-width: 640px) {
  .location-search-panel {
    padding: 18px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .description {
    text-align: left;
  }

  .search-row,
  .result-content {
    align-items: stretch;
    flex-direction: column;
  }

  .search-row button,
  .add-button {
    width: 100%;
  }

  .map-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .map-heading > p {
    text-align: left;
  }
}
</style>
