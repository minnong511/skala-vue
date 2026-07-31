import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/',
    },
    {
      path: '/',
      name: '',
      component: AboutView,
    },
  ],
})

export default router
