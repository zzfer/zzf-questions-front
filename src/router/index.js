import { createRouter, createWebHistory } from 'vue-router'
import AdminPanel from '../views/AdminPanel.vue'
import FrontendDisplay from '../views/FrontendDisplay.vue'

const routes = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPanel
  },
  {
    path: '/frontend',
    name: 'Frontend',
    component: FrontendDisplay
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router