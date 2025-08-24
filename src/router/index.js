import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AdminPanel from '../views/AdminPanel.vue'
import FrontendDisplay from '../views/FrontendDisplay.vue'
import HouseValueCalculator from '../views/HouseValueCalculator.vue'
import ExpenseForm from '../views/ExpenseForm.vue'
import ExpenseStatistics from '../views/ExpenseStatistics.vue'
import CategoryManagement from '../views/CategoryManagement.vue'
import AssetRecord from '../views/AssetRecord.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
  },
  {
    path: '/house-calculator',
    name: 'HouseCalculator',
    component: HouseValueCalculator
  },
  {
    path: '/expense-form',
    name: 'ExpenseForm',
    component: ExpenseForm
  },
  {
    path: '/expense-statistics',
    name: 'ExpenseStatistics',
    component: ExpenseStatistics
  },
  {
    path: '/category-management',
    name: 'CategoryManagement',
    component: CategoryManagement
  },
  {
    path: '/asset-record',
    name: 'AssetRecord',
    component: AssetRecord
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router