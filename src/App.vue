<script setup>
import { RouterLink, RouterView } from 'vue-router'

import LightMode from './components/exercise/LightMode.vue'
import UnitToggler from './components/exercise/UnitToggler.vue'
import { useConfigStore } from './stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div
    class="app-shell"
    :class="{ 'theme-dark': configStore.isDarkMode }"
  >
    <!-- 헤더  -->
    <header class="app-header">
      <div class="app-header-inner">
        <nav class="navigation-bar" aria-label="주요 메뉴">
          <RouterLink to="/" class="brand-link">날씨 대시보드</RouterLink>
          <RouterLink to="/" class="navigation-link">홈</RouterLink>
          <RouterLink to="/project" class="navigation-link">프로젝트 타임라인</RouterLink>
          <RouterLink to="/additional-feature" class="navigation-link">추가 기능(404 확인용)</RouterLink>
        </nav>

        <div class="header-controls">
          <UnitToggler />
          <LightMode />
        </div>
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
  </div>

</template>

<!-- CSS는 Scoped로 여기서 바꾸는 것임. 근데 나 어차피 디자인 안할 거니까 일단은 생략. -->

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 58%);
  box-shadow: 0 10px 30px rgb(30 64 175 / 8%);
  backdrop-filter: blur(18px) saturate(135%);
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

.header-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
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
  color: #1e293b;
  text-decoration: none;
}

.brand-link {
  color: #1d4ed8;
  font-size: 1.1rem;
  font-weight: 700;
}

.navigation-link:hover,
.navigation-link.router-link-exact-active {
  background: rgb(219 234 254 / 72%);
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

  .header-controls {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .navigation-bar {
    flex-wrap: wrap;
  }

  .app-main {
    padding: 16px;
  }
}

.app-header {
  border-bottom-color: rgb(255 255 255 / 64%);
  background: rgb(248 250 252 / 44%);
  box-shadow: 0 12px 36px rgb(30 64 175 / 10%);
  backdrop-filter: blur(24px) saturate(150%);
}

.app-header-inner {
  max-width: 1480px;
}

.navigation-bar {
  gap: 10px;
}

.brand-link,
.navigation-link {
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease,
    transform 0.25s ease;
}

.brand-link {
  color: #1e3a8a;
  letter-spacing: -0.03em;
}

.navigation-link:hover,
.navigation-link.router-link-exact-active {
  border-color: rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 48%);
  box-shadow: 0 8px 18px rgb(37 99 235 / 10%);
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .brand-link,
  .navigation-link {
    transition: none;
  }
}
</style>
