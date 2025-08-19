<template>
  <div class="expense-form-container">
    <div class="form-header">
      <h2>{{ isEdit ? '编辑记账' : '添加记账' }}</h2>
      <p class="subtitle">记录您的每一笔支出</p>
    </div>
    
    <el-card class="form-card">
      <el-form
        ref="expenseFormRef"
        :model="expenseForm"
        :rules="formRules"
        label-width="100px"
        size="large"
      >
        <el-form-item label="金额" prop="amount">
          <el-input
            v-model="expenseForm.amount"
            placeholder="请输入金额"
            type="number"
            step="0.01"
            min="0"
            prefix-icon="Money"
          >
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="expenseForm.category"
            placeholder="请选择分类"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            >
              <span>
                <span v-if="getIconComponent(category.icon) === null" 
                      style="margin-right: 8px; font-size: 18px;">
                  {{ category.icon }}
                </span>
                <Icon v-else :icon="getIconComponent(category.icon)" style="margin-right: 8px; font-size: 18px;" />
                {{ category.name }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期" prop="expenseDate">
          <el-date-picker
            v-model="expenseForm.expenseDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="支出人" prop="payer">
          <el-select
            v-model="expenseForm.payer"
            placeholder="请选择支出人"
            style="width: 100%"
          >
            <el-option label="苏苏" value="苏苏" />
            <el-option label="飞飞" value="飞飞" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="公共支出">
          <el-switch
            v-model="expenseForm.isPublicExpense"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
          <span class="switch-description">开启后表示此支出为公共支出</span>
        </el-form-item>
        
        <el-form-item label="备注" prop="description">
          <el-input
            v-model="expenseForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-buttons">
            <el-button size="large" @click="resetForm">重置</el-button>
            <el-button 
              type="primary" 
              size="large" 
              @click="submitForm"
              :loading="submitting"
            >
              {{ isEdit ? '更新' : '保存' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 最近记录 -->
    <el-card class="recent-records" v-if="recentExpenses.length > 0">
      <template #header>
        <div class="card-header">
          <span>最近记录</span>
          <el-button text @click="viewAllRecords">查看全部</el-button>
        </div>
      </template>
      
      <div class="recent-list">
        <div 
          v-for="expense in recentExpenses" 
          :key="expense.id"
          class="recent-item"
          @click="editExpense(expense)"
        >
          <div class="item-left">
              <div class="category">
                <span v-if="getIconComponent(expense.categoryIcon) === null" 
                      style="margin-right: 8px; font-size: 18px;">
                  {{ expense.categoryIcon }}
                </span>
                <Icon v-else :icon="getIconComponent(expense.categoryIcon)" style="margin-right: 8px; font-size: 18px;" />
                {{ expense.categoryName }}<span class="category-desc" v-if="expense.description">({{ expense.description }})</span>
              </div>
              <div class="date">{{ formatDate(expense.expenseDate) }} · {{ expense.payer }}</div>
            </div>
          <div class="item-right">
            <span class="amount">¥{{ expense.amount }}</span>
            <el-button 
              type="danger" 
              text 
              size="small" 
              @click.stop="deleteExpense(expense.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import api from '@/api/index'
import { Icon } from '@iconify/vue'

const router = useRouter()
const expenseFormRef = ref()
const submitting = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

// 表单数据
const expenseForm = reactive({
  amount: '',
  category: '',
  expenseDate: new Date().toISOString().split('T')[0], // 默认今天
  payer: localStorage.getItem('lastPayer') || '', // 从本地存储获取上次选择的支出人
  description: '',
  isPublicExpense: false // 默认不是公共支出
})

// 分类数据
const categories = ref([])

// 最近记录
const recentExpenses = ref([])

// 表单验证规则
const formRules = {
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('金额必须大于0'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  expenseDate: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  payer: [
    { required: true, message: '请选择支出人', trigger: 'change' }
  ]
}

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
const getCategoryIcon = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.icon : 'More'
}

// 获取图标名称（Iconify彩色图标）
const getIconComponent = (iconName) => {
  if (!iconName) return null
  
  // 处理旧的Element Plus图标名称映射
  const iconMap = {
    'Food': 'flat-color-icons:restaurant',
    'Truck': 'flat-color-icons:automotive',
    'Car': 'flat-color-icons:automotive', 
    'Van': 'flat-color-icons:automotive',
    'Bus': 'flat-color-icons:automotive',
    'Bicycle': 'flat-color-icons:automotive',
    'ShoppingBag': 'flat-color-icons:shop',
    'VideoPlay': 'flat-color-icons:music',
    'FirstAidKit': 'flat-color-icons:biohazard',
    'Reading': 'flat-color-icons:reading',
    'House': 'flat-color-icons:home',
    'Phone': 'flat-color-icons:phone',
    'Iphone': 'flat-color-icons:phone',
    'Present': 'flat-color-icons:briefcase',
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
const getCategoryName = (categoryId) => {
  console.log(categoryId, categories.value);
  
  const category = categories.value.find(cat => cat.id === categoryId)
  console.log(category);
  
  return category ? category.categoryName : '未知分类'
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 提交表单
const submitForm = async () => {
  if (!expenseFormRef.value) return
  
  try {
    await expenseFormRef.value.validate()
    submitting.value = true
    
    const formData = {
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      categoryId: expenseForm.category // 将category字段映射为categoryId
    }
    // 删除原来的category字段，避免混淆
    delete formData.category
    
    let response
    if (isEdit.value) {
      response = await api.put(`/api/expenses/${editingId.value}`, formData)
    } else {
      response = await api.post('/api/expenses', formData)
    }
    
    if (response.data.success) {
      ElMessage.success(isEdit.value ? '记账记录更新成功' : '记账记录保存成功')
      // 保存支出人到本地存储
      localStorage.setItem('lastPayer', expenseForm.payer)
      resetForm()
      loadRecentExpenses()
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (expenseFormRef.value) {
    expenseFormRef.value.resetFields()
  }
  const lastPayer = expenseForm.payer // 保存当前支出人
  expenseForm.amount = ''
  expenseForm.category = ''
  expenseForm.expenseDate = new Date().toISOString().split('T')[0]
  expenseForm.payer = lastPayer // 保持支出人不变
  expenseForm.description = ''
  expenseForm.isPublicExpense = false // 重置为非公共支出
  isEdit.value = false
  editingId.value = null
}

// 编辑记录
const editExpense = (expense) => {
  isEdit.value = true
  editingId.value = expense.id
  expenseForm.amount = expense.amount.toString()
  expenseForm.category = expense.category
  expenseForm.expenseDate = expense.expenseDate
  expenseForm.payer = expense.payer || ''
  expenseForm.description = expense.description || ''
  expenseForm.isPublicExpense = expense.isPublicExpense || false
}

// 删除记录
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
      loadRecentExpenses()
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

// 查看所有记录
const viewAllRecords = () => {
  router.push('/expense-statistics')
}

// 加载最近记录
const loadRecentExpenses = async () => {
  try {
    const response = await api.get('/api/expenses/recent')
    if (response.data.success) {
      recentExpenses.value = response.data.data
    }
  } catch (error) {
    console.error('加载最近记录失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
  loadRecentExpenses()
})
</script>

<style scoped>
.expense-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
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

.form-card {
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.recent-records {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-list {
  max-height: 400px;
  overflow-y: auto;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recent-item:hover {
  background-color: #f8f9fa;
}

.recent-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.category {
  font-weight: 500;
  color: #2c3e50;
}
.category-desc{
  opacity: .8;
  font-size: .8rem;
}
.category i {
  margin-right: 8px;
  font-size: 16px;
  color: #409eff;
}

.date {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.amount {
  font-weight: 600;
  color: #e74c3c;
  font-size: 1.1rem;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.el-input__inner) {
  border-radius: 8px;
}

:deep(.el-select .el-input__inner) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
}

.switch-description {
  margin-left: 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 分类选择器中的图标样式 */
:deep(.el-select-dropdown__item span i) {
  margin-right: 8px;
  font-size: 16px;
  color: #409eff;
  width: 20px;
  text-align: center;
}
</style>