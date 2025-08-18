<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="header" v-if="showHeader">
        <div class="header-content">
          <el-button 
            type="primary" 
            :icon="House" 
            @click="goHome"
            class="home-button"
          >
            返回主页
          </el-button>
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
      </el-header>
      <el-main class="main-content" :class="{ 'no-header': !showHeader }">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House } from '@element-plus/icons-vue'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const showHeader = computed(() => {
      return route.path !== '/'
    })
    
    const pageTitle = computed(() => {
      const titleMap = {
        '/admin': '后台管理',
        '/frontend': '题目展示',
        '/house-calculator': '房产计算器',
        '/city-analysis': '城市小区分析'
      }
      return titleMap[route.path] || ''
    })
    
    const goHome = () => {
      router.push('/')
    }

    return {
      showHeader,
      pageTitle,
      goHome,
      House
    }
  }
}
</script>

<style>
#app {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

.header {
  padding: 0 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 20px;
}

.home-button {
  border-radius: 20px;
}

.page-title {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.main-content {
  padding: 20px;
}

.main-content.no-header {
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
}
</style>