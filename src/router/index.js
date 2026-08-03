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
