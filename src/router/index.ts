import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/index',
      alias: '/',
      name: 'index',
      component: () => import('@/pages/IndexPage.vue'),
    },
  ],
})

export default router
