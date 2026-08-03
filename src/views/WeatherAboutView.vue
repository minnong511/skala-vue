<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <section class="about-container">
    <p class="eyebrow">ABOUT THIS PROJECT</p>
    <h1>지역별 날씨 관측 대시보드</h1>
    <p class="description">
      Vue 3의 반응형 상태 관리, 컴포넌트 통신, Vue Router, Pinia를 연습하기 위한
      날씨 대시보드입니다.
    </p>

    <ul>
      <li>검색어와 날씨 목록을 반응형 상태로 관리합니다.</li>
      <li>props, emits, slot으로 컴포넌트를 분리했습니다.</li>
      <li>도시 상세 페이지와 섭씨/화씨 단위 전환을 제공합니다.</li>
    </ul>

    <button
      type="button"
      class="home-btn"
      @click="goHome"
    >
      대시보드 홈으로 이동
    </button>
  </section>
</template>

<style scoped>
.about-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(30 64 175 / 8%);
}

.eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.8rem;
}

.description {
  margin: 18px 0;
  color: #475569;
  line-height: 1.8;
}

ul {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.9;
}

.home-btn {
  margin-top: 24px;
  padding: 10px 14px;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.home-btn:hover {
  background: #1d4ed8;
}
</style>
