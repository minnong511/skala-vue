import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createDebugLogger } from './utils/debugLogger'

const app = createApp(App)
const logger = createDebugLogger('VueApp')

app.config.errorHandler = (error, component, info) => {
  logger.error('Vue 전역 오류가 발생했습니다.', error, {
    component: component?.$options?.name ?? '이름 없는 컴포넌트',
    info,
  })
}

router.afterEach((to, from) => {
  logger.success('라우팅 완료', {
    from: from.fullPath,
    to: to.fullPath,
  })
})

router.onError((error, to, from) => {
  logger.error('라우팅 오류', error, {
    to: to?.fullPath,
    from: from?.fullPath,
  })
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
