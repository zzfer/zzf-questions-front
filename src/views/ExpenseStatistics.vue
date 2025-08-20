<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>记账统计</h2>
      <p class="subtitle">查看您的支出分析和趋势</p>
    </div>
    
    <!-- 统计概览 -->
    <div class="overview-cards">
      <el-card class="overview-card">
        <div class="card-content">
          <div class="icon">💰</div>
          <div class="info">
            <div class="value">¥{{ totalAmount.toFixed(2) }}</div>
            <div class="label">总支出</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="overview-card">
        <div class="card-content">
          <div class="icon">📊</div>
          <div class="info">
            <div class="value">{{ totalCount }}</div>
            <div class="label">记录数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="overview-card">
        <div class="card-content">
          <div class="icon">📅</div>
          <div class="info">
            <div class="value">¥{{ avgDaily.toFixed(2) }}</div>
            <div class="label">日均支出</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="overview-card">
        <div class="card-content">
          <div class="icon">🏆</div>
          <div class="info">
            <div class="value">{{ topCategory }}</div>
            <div class="label">最大支出类别</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 时间筛选 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>时间范围：</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadStatistics"
          />
        </div>
        
        <div class="filter-item">
          <label>快速选择：</label>
          <el-button-group>
            <el-button @click="setDateRange('week')">最近一周</el-button>
            <el-button @click="setDateRange('month')">最近一月</el-button>
            <el-button @click="setDateRange('quarter')">最近三月</el-button>
            <el-button @click="setDateRange('year')">最近一年</el-button>
          </el-button-group>
        </div>
      </div>
    </el-card>
    
    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 分类饼图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>支出分类分布</span>
            <el-button text @click="toggleChartType('pie')">{{ pieChartType === 'pie' ? '环形图' : '饼图' }}</el-button>
          </div>
        </template>
        <div ref="pieChartRef" class="chart-container"></div>
      </el-card>
      
      <!-- 月度趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>月度支出趋势</span>
            <el-button text @click="toggleChartType('bar')">{{ barChartType === 'bar' ? '折线图' : '柱状图' }}</el-button>
          </div>
        </template>
        <div ref="barChartRef" class="chart-container"></div>
      </el-card>
    </div>
    
    <!-- 详细列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="list-header">
          <span>支出记录</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索备注或分类"
              style="width: 200px; margin-right: 10px"
              clearable
              @input="filterExpenses"
            />
            <el-button type="primary" @click="$router.push('/expense-form')">添加记录</el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="filteredExpenses"
        style="width: 100%"
        :default-sort="{prop: 'expenseDate', order: 'descending'}"
        max-height="400"
      >
        <el-table-column prop="expenseDate" label="日期" width="120" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.expenseDate) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <span v-if="getCategoryIcon(scope.row.categoryIcon) === null" 
                  style="margin-right: 8px; font-size: 18px;">
              {{ scope.row.categoryIcon }}
            </span>
            <Icon v-else :icon="getCategoryIcon(scope.row.categoryIcon)" style="margin-right: 8px; font-size: 18px;" />
            {{ scope.row.categoryName }}
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="金额" width="120" sortable>
          <template #default="scope">
            <span class="amount-text">¥{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="payer" label="支出人" width="100">
          <template #default="scope">
            <span>{{ scope.row.payer || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="isPublicExpense" label="公共支出" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isPublicExpense ? 'success' : 'info'" size="small">
              {{ scope.row.isPublicExpense ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="备注" min-width="150">
          <template #default="scope">
            <span>{{ scope.row.description || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              type="primary" 
              text 
              size="small" 
              @click="editExpense(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              text 
              size="small" 
              @click="deleteExpense(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalExpenses"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadExpenses"
          @current-change="loadExpenses"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import api from '@/api/index'
import * as echarts from 'echarts'
import { Icon } from '@iconify/vue'

const router = useRouter()

// 图表引用
const pieChartRef = ref()
const barChartRef = ref()
let pieChart = null
let barChart = null

// 图表类型
const pieChartType = ref('pie')
const barChartType = ref('bar')

// 数据状态
const statistics = ref({})
const expenses = ref([])
const filteredExpenses = ref([])
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalExpenses = ref(0)

// 时间筛选
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  new Date().toISOString().split('T')[0]
])

// 分类数据
const categories = ref([])

// 计算属性
const totalAmount = computed(() => statistics.value.totalAmount || 0)
const totalCount = computed(() => statistics.value.totalCount || 0)
const avgDaily = computed(() => {
  if (!statistics.value.dailyStatistics || statistics.value.dailyStatistics.length === 0) return 0
  const actualDays = statistics.value.dailyStatistics.length
  return actualDays > 0 ? totalAmount.value / actualDays : 0
})
const topCategory = computed(() => {
  if (!statistics.value.categoryStatistics || statistics.value.categoryStatistics.length === 0) return '-'
  return statistics.value.categoryStatistics[0].category
})

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await api.get('/api/categories')
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  }
}

// 获取分类图标
const getCategoryIcon = (iconName) => {
  if (!iconName) return null
  
  // 处理旧的Element Plus图标名称映射
  const iconMap = {
    'Bicycle': 'flat-color-icons:automotive',
    'ShoppingBag': 'flat-color-icons:shop',
    'VideoPlay': 'flat-color-icons:music',
    'FirstAidKit': 'flat-color-icons:biohazard',
    'Reading': 'flat-color-icons:reading',
    'House': 'flat-color-icons:home',
    'Iphone': 'flat-color-icons:phone',
    'Gift': 'flat-color-icons:briefcase',
    'More': 'flat-color-icons:settings'
  }
  
  // 如果是旧的图标名称，转换为新的
  if (iconMap[iconName]) {
    return iconMap[iconName]
  }
  
  // 如果已经是Iconify格式，直接返回
  if (iconName && iconName.includes(':')) {
    return iconName
  }
  
  // 默认返回原始名称
  return iconName
}

// 获取分类名称
const getCategoryName = (categoryName) => {
  const category = categories.value.find(cat => cat.name === categoryName)
  return category ? category.name : categoryName || '未知分类'
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 设置日期范围
const setDateRange = (type) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  let startDate
  switch (type) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  
  dateRange.value = [startDate.toISOString().split('T')[0], today]
  loadStatistics()
}

// 切换图表类型
const toggleChartType = (chartType) => {
  if (chartType === 'pie') {
    pieChartType.value = pieChartType.value === 'pie' ? 'doughnut' : 'pie'
    renderPieChart()
  } else if (chartType === 'bar') {
    barChartType.value = barChartType.value === 'bar' ? 'line' : 'bar'
    renderBarChart()
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const params = {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    }
    
    const response = await api.get('/api/expenses/statistics', { params })
    
    if (response.data.success) {
      statistics.value = response.data.data
      await nextTick()
      renderCharts()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 加载支出记录
const loadExpenses = async () => {
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    }
    
    const response = await api.get('/api/expenses', { params })
    
    if (response.data.success) {
      expenses.value = response.data.data.content
      totalExpenses.value = response.data.data.totalElements
      filterExpenses()
    }
  } catch (error) {
    console.error('加载支出记录失败:', error)
    ElMessage.error('加载支出记录失败')
  }
}

// 筛选支出记录
const filterExpenses = () => {
  if (!searchKeyword.value) {
    filteredExpenses.value = expenses.value
  } else {
    const keyword = searchKeyword.value.toLowerCase()
    filteredExpenses.value = expenses.value.filter(expense => 
      expense.category.toLowerCase().includes(keyword) ||
      (expense.description && expense.description.toLowerCase().includes(keyword))
    )
  }
}

// 渲染图表
const renderCharts = () => {
  renderPieChart()
  renderBarChart()
}

// 渲染饼图
const renderPieChart = () => {
  if (!pieChartRef.value || !statistics.value.categoryStatistics) return
  
  if (pieChart) {
    pieChart.dispose()
  }
  
  pieChart = echarts.init(pieChartRef.value)
  
  const data = statistics.value.categoryStatistics.map(item => ({
    name: item.category,
    value: item.amount
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '支出分类',
      type: 'pie',
      radius: pieChartType.value === 'doughnut' ? ['40%', '70%'] : '70%',
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: data
    }]
  }
  
  pieChart.setOption(option)
}

// 渲染柱状图
const renderBarChart = () => {
  if (!barChartRef.value || !statistics.value.monthlyStatistics) return
  
  if (barChart) {
    barChart.dispose()
  }
  
  barChart = echarts.init(barChartRef.value)
  
  const months = statistics.value.monthlyStatistics.map(item => item.month)
  const amounts = statistics.value.monthlyStatistics.map(item => item.amount)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: ¥{c}'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [{
      name: '月度支出',
      type: barChartType.value,
      data: amounts,
      itemStyle: {
        color: '#409EFF'
      }
    }]
  }
  
  barChart.setOption(option)
}

// 编辑支出记录
const editExpense = (expense) => {
  router.push({
    path: '/expense-form',
    query: { id: expense.id }
  })
}

// 删除支出记录
const deleteExpense = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await api.delete(`/api/expenses/${id}`)
    
    if (response.data.success) {
      ElMessage.success('删除成功')
      loadStatistics()
      loadExpenses()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 组件挂载
onMounted(() => {
  loadCategories()
  loadStatistics()
  loadExpenses()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (pieChart) pieChart.resize()
    if (barChart) barChart.resize()
  })
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (pieChart) pieChart.dispose()
  if (barChart) barChart.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.statistics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.info {
  flex: 1;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.filter-card {
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.list-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.amount-text {
  color: #e74c3c;
  font-weight: 600;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .list-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>