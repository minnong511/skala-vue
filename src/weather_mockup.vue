<script setup>
import { ref } from 'vue'

// 날씨 데이터
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

// 선택된 도시 정보
const selectedCityInfo = ref(null)

// 상세보기 버튼
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// 카드 클릭
const selectCity = (city) => {
  selectedCityInfo.value = city
}
</script>

<template>
  <div class="city-container">
    <!-- 날씨 카드 반복 출력 -->
    <div v-for="city in weatherList" :key="city.id" class="weather-card" @click="selectCity(city)">
      <h3>{{ city.name }}</h3>

      <p>현재 온도 : {{ city.temp }}℃</p>

      <p>날씨 : {{ city.status }}</p>

      <!-- 조건부 렌더링 -->
      <p v-if="city.temp >= 25">🔥 더움 (25도 이상)</p>

      <p v-else>❄️ 선선함 (25도 미만)</p>

      <!-- 상세보기 버튼 -->
      <button @click.stop="showDetail(city.name, city.status)">상세보기</button>
    </div>
  </div>

  <!-- 상태 표시 -->
  <div class="status-bar">
    <p v-if="selectedCityInfo">{{ selectedCityInfo.name }}이 선택되었습니다.</p>

    <p v-else>도시를 선택해주세요.</p>
  </div>
</template>

<style scoped>
.city-container {
  display: flex;
  gap: 20px;
}

.weather-card {
  border: 1px solid #ddd;
  padding: 20px;
  cursor: pointer;
}

.status-bar {
  margin-top: 20px;
  font-weight: bold;
}
</style>
