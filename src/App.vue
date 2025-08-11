<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="header">
        <el-menu mode="horizontal" :default-active="activeIndex" router>
          <el-menu-item index="/admin">后台管理</el-menu-item>
          <el-menu-item index="/frontend">题目展示</el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    
    const activeIndex = computed(() => {
      return route.path.startsWith('/admin') ? '/admin' : '/frontend'
    })

    return {
      activeIndex
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
  padding: 0;
  border-bottom: 1px solid #e6e6e6;
}

.main-content {
  padding: 20px;
}

body {
  margin: 0;
  padding: 0;
}
</style>