<!-- WeatherHomeView 여기가 불러오면 <HomeView />가 렌더링된다 -->
<!-- Vue 프로젝트에서 Views 폴더 안에는 보통 "페이지 단위 컴포넌트"가 들어간다.

Views -> 페이지
components -> 페이지를 구성하는 작은 단위 컴포넌트

src
├── App.vue
├── main.js
├── router
│   └── index.js
│
├── views
│   ├── HomeView.vue
│   ├── PracticeView.vue
│   └── ProjectView.vue
│
└── components
    ├── WeatherCard.vue
    ├── SearchBar.vue
    └── UnitToggler.vue

자자 잘 기억할 수 있도록

-->

<script setup>
// 여기가 진짜 페이지 내용물
// 파일 자체는 사실상 페이지를 연결하는 껍데기(wrapper) 역할

import WeatherParent from '../components/exercise/WeatherParent.vue'
</script>

<template>
  <WeatherParent />
</template>

<!--
App.vue
 |
 └── RouterView
       |
       └── PracticeView.vue  ← 현재 페이지
              |
              └── WeatherParent.vue ← 실제 화면 내용
                     |
                     ├── SearchBar.vue
                     ├── WeatherCard.vue
                     └── BaseDashboardCard.vue
                     (카드 UI가 이제 들어가게 된다)
-->
