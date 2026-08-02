<script setup>
// 과제보다 추가된 기능

// 1. 선택한 카드 강조
// 2. 날씨 상태별 아이콘 표시
//3 . 전체 도시 수 / 더운 도시 수 표시
// 4. 검색어 초기화 버튼

import { computed, ref } from 'vue'

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
  },
])

const selectedCityInfo = ref(null)
const searchKeyword = ref('')

// 상세보기
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// 도시 선택
const selectCity = (city) => {
  selectedCityInfo.value = city
}

// 검색어 초기화
const resetSearch = () => {
  searchKeyword.value = ''
}

// 검색 결과
const filteredWeatherList = computed(() => {
  const keyword = searchKeyword.value.trim()

  return weatherList.value.filter((city) => {
    return city.name.includes(keyword)
  })
})

// 더운 도시 개수
const hotCityCount = computed(() => {
  return weatherList.value.filter((city) => {
    return city.temp >= 25
  }).length
})

// 날씨 상태별 아이콘
const getWeatherIcon = (status) => {
  if (status === '맑음') {
    return '☀️'
  }

  if (status === '비') {
    return '🌧️'
  }

  if (status === '구름') {
    return '☁️'
  }

  return '🌡️'
}
</script>

<template>
  <main class="city-container">
    <header class="page-header">
      <h1>지역별 날씨 현황</h1>

      <div class="weather-summary">
        <span>전체 도시: {{ weatherList.length }}개</span>
        <span>더운 도시: {{ hotCityCount }}개</span>
      </div>
    </header>

    <!-- 검색 영역 -->
    <section class="search-section">
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="search"
          placeholder="도시를 검색하세요"
        />

        <button
          v-if="searchKeyword"
          type="button"
          class="reset-button"
          @click="resetSearch"
        >
          검색 초기화
        </button>
      </div>

      <p class="search-message">
        입력한 도시명:
        <strong>
          {{ searchKeyword || '없음' }}
        </strong>
      </p>
    </section>

    <!-- 날씨 카드 목록 -->
    <section>
      <div
        v-if="filteredWeatherList.length > 0"
        class="weather-list"
      >
        <article
          v-for="city in filteredWeatherList"
          :key="city.id"
          class="weather-card"
          :class="{
            selected: selectedCityInfo?.id === city.id,
          }"
          @click="selectCity(city)"
        >
          <div class="card-header">
            <h2>{{ city.name }}</h2>

            <span class="weather-icon">
              {{ getWeatherIcon(city.status) }}
            </span>
          </div>

          <p>현재 온도: {{ city.temp }}℃</p>
          <p>날씨: {{ city.status }}</p>

          <p
            v-if="city.temp >= 25"
            class="temperature-label hot"
          >
            🔥 더움 (25도 이상)
          </p>

          <p
            v-else
            class="temperature-label cool"
          >
            ❄️ 선선함 (25도 미만)
          </p>

          <button
            type="button"
            class="detail-button"
            @click.stop="showDetail(city.name, city.status)"
          >
            상세보기
          </button>
        </article>
      </div>

      <p v-else class="empty-message">
        '{{ searchKeyword }}'에 대한 검색 결과가 없습니다.
      </p>
    </section>

    <!-- 상태 표시 -->
    <section class="status-bar">
      <template v-if="selectedCityInfo">
        <p>
          {{ selectedCityInfo.name }}이 선택되었습니다.
        </p>

        <p>
          현재 온도는 {{ selectedCityInfo.temp }}℃이며,
          날씨는 {{ selectedCityInfo.status }}입니다.
        </p>
      </template>

      <p v-else>
        도시를 선택해주세요.
      </p>
    </section>
  </main>
</template>

<style scoped>
.city-container {
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-header h1 {
  margin: 0;
}

.weather-summary {
  display: flex;
  gap: 12px;
}

.weather-summary span {
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f3f4f6;
  font-weight: 600;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}

.reset-button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background-color: #6b7280;
  color: white;
  cursor: pointer;
}

.search-message {
  margin: 0;
  color: #4b5563;
}

.weather-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.weather-card {
  width: 240px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background-color: white;
  cursor: pointer;
  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.weather-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 10%);
}

.weather-card.selected {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  margin: 0;
}

.weather-icon {
  font-size: 32px;
}

.temperature-label {
  padding: 8px;
  border-radius: 6px;
  font-weight: 600;
}

.temperature-label.hot {
  background-color: #fff1f2;
  color: #be123c;
}

.temperature-label.cool {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.detail-button {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #111827;
  color: white;
  cursor: pointer;
}

.detail-button:hover {
  background-color: #374151;
}

.empty-message {
  padding: 24px;
  border-radius: 10px;
  background-color: #f9fafb;
  text-align: center;
  color: #6b7280;
}

.status-bar {
  padding: 18px;
  border-radius: 10px;
  background-color: #f3f4f6;
  font-weight: 600;
}

.status-bar p {
  margin: 4px 0;
}

@media (max-width: 640px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-summary {
    flex-wrap: wrap;
  }

  .search-box {
    flex-direction: column;
  }

  .weather-card {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
