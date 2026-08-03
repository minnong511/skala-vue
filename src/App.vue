<script setup>
import { RouterLink, RouterView } from 'vue-router'

import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>

  <!-- 헤더  -->
  <header class="app-header">
    <div class="app-header-inner">
      <nav class="navigation-bar" aria-label="주요 메뉴">
        <RouterLink to="/" class="brand-link">날씨 대시보드</RouterLink>
        <RouterLink to="/" class="navigation-link">홈</RouterLink>
        <RouterLink to="/practice" class="navigation-link">실습 과제</RouterLink>
        <RouterLink to="/project" class="navigation-link">프로젝트 타임라인</RouterLink>
      </nav>

      <UnitToggler />
    </div>
  </header>
  <!-- 헤더는 항상 표시되는 부분 -->

  <!-- RouterView (페이지가 바뀌는 부분)
        ├── HomeView.vue
        ├── PracticeView.vue
        └── ProjectView.vue
  여기가 실제로 바꾸는 부분임
  router/index.js에서 설정한 라우터에 따라 바뀌는 부분을 확인할 수 있도록
  -->
  <main class="app-main">
    <RouterView />
  </main>

</template>

<!-- CSS는 Scoped로 여기서 바꾸는 것임. 근데 나 어차피 디자인 안할 거니까 일단은 생략. -->

<style scoped>
.app-header {
  border-bottom: 1px solid #dbe4f0;
  background: #ffffff;
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  gap: 24px;
}

.navigation-bar {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand-link,
.navigation-link {
  padding: 6px 8px;
  border-radius: 6px;
  color: #334155;
  text-decoration: none;
}

.brand-link {
  color: #1d4ed8;
  font-size: 1.1rem;
  font-weight: 700;
}

.navigation-link:hover,
.navigation-link.router-link-exact-active {
  background: #eff6ff;
  color: #1d4ed8;
}

.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 640px) {
  .app-header-inner {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }

  .navigation-bar {
    flex-wrap: wrap;
  }

  .app-main {
    padding: 16px;
  }
}
</style>
