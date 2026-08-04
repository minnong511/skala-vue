import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // SPA (Single Page Application) -> Vue Router -> RouterView
  // 이게 핵심이다.
  // http://localhost:5173/
  // <RouterView />
  // 여기에 초기에 <HomeView /> 들어간다.
  // http://localhost:5173/practice -> <ProjectView />


  // 여기가 홈이다.
  {
    path: '/',
    name: 'WeatherHome',
    component: () => import('../views/WeatherHomeView.vue'),
  },

  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  // Practice 임
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../views/PracticeView.vue'),
  },
  // Project 임
  {
    path: '/project',
    name: 'Project',
    component: () => import('../views/ProjectView.vue'),
  },
  // WeatherDetail 임
  {
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  // NotFound 임, 404 페이지임.
  // 일부러 잘못된 페이지로 구현

  
  // catch-all 라우트 -> 어떤 라우트와도 일치하는 주소를 마치막에 처리하는 예외용 라우트
  // NotFoundView.vue 표시
  // 반드시 라우트 목록의 가장 아래에 배치해야 한다.
    // 다만 Axios API 오류
    // JavaScirpt 살행 오류
    // API 키 오류
    // 컴포넌트 내부 오류
    // 와 같은 오류는 처리하지 않는다.

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },

  // URL 변경 -> Vue Router -> RoutherView 내용 변경
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
