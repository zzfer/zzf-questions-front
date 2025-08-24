<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="title">ZZF工具</h1>
      <p class="subtitle">乱七八糟小工具</p>
    </div>
    
    <div class="features-grid">
      <div class="feature-card" @click="navigateTo('/admin')">
        <div class="feature-icon">
          <el-icon size="48"><Setting /></el-icon>
        </div>
        <h3>后台管理</h3>
        <p>管理题目和系统配置</p>
        <el-button type="primary" size="large">进入管理</el-button>
      </div>
      
      <div class="feature-card" @click="navigateTo('/frontend')">
        <div class="feature-icon">
          <el-icon size="48"><Document /></el-icon>
        </div>
        <h3>题目展示</h3>
        <p>查看和答题系统</p>
        <el-button type="primary" size="large">开始答题</el-button>
      </div>
      
      <div class="feature-card" @click="navigateTo('/house-calculator')">
        <div class="feature-icon">
          <el-icon size="48"><House /></el-icon>
        </div>
        <h3>房产计算器</h3>
        <p>房产投资收益计算工具</p>
        <el-button type="primary" size="large">开始计算</el-button>
      </div>
      
      <div class="feature-card" @click="navigateTo('/expense-form')">
        <div class="feature-icon">
          <el-icon size="48"><Money /></el-icon>
        </div>
        <h3>记账管理</h3>
        <p>记录和管理您的日常支出</p>
        <el-button type="primary" size="large">开始记账</el-button>
      </div>
      
      <div class="feature-card" @click="navigateTo('/expense-statistics')">
        <div class="feature-icon">
          <el-icon size="48"><DataAnalysis /></el-icon>
        </div>
        <h3>支出统计</h3>
        <p>查看支出分析和统计图表</p>
        <el-button type="primary" size="large">查看统计</el-button>
      </div>
      
      <div class="feature-card" @click="navigateTo('/category-management')">
        <div class="feature-icon">
          <el-icon size="48"><Grid /></el-icon>
        </div>
        <h3>分类管理</h3>
        <p>管理记账分类和图标设置</p>
        <el-button type="primary" size="large">管理分类</el-button>
      </div>
      
      <div class="feature-card" @click="navigateTo('/asset-record')">
        <div class="feature-icon">
          <el-icon size="48"><Wallet /></el-icon>
        </div>
        <h3>资产记录</h3>
        <p>管理您的资产和收入记录</p>
        <el-button type="primary" size="large">管理资产</el-button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Setting, Document, House, Money, DataAnalysis, Grid, Wallet } from '@element-plus/icons-vue'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  border-color: #409eff;
}

.feature-icon {
  margin-bottom: 20px;
  color: #409eff;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.feature-card .el-button {
  width: 140px;
  height: 45px;
  font-size: 16px;
  border-radius: 25px;
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    padding: 30px 20px;
  }
}
</style>