<template>
  <div class="strong-road-container">
    <div class="page-header">
      <h2>强者之路</h2>
      <p class="subtitle">记录每日活动，成为更强的自己</p>
    </div>

    <!-- 当日汇总（移到最前） -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>当日汇总</span>
          <div class="actions">
            <el-date-picker v-model="date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="onDateChange" />
            <el-button type="primary" @click="openAddRecordDialog">新增</el-button>
          </div>
        </div>
      </template>
      <div class="summary-list" v-loading="loading.summary">
        <div class="summary-item" v-for="cat in summary" :key="cat.categoryId">
          <div class="summary-header">
            <span class="emoji">{{ cat.icon }}</span>
            <span class="name">{{ cat.categoryName }}</span>
          </div>
          <ul>
            <li v-for="it in cat.items" :key="it.itemId">{{ it.itemName }} <span>{{ it.totalQuantity || 0 }}{{ it.unit || '' }}（{{ recordCountByItem[it.itemId] || 0 }}次）</span></li>
          </ul>
          <div class="svg-preview">
            <img :src="getSvgUrl(date, cat.categoryId, 'classic')" alt="svg" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 活动项目（保留中间位置） -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>活动项目</span>
          <div class="actions">
            <el-input v-model="itemQuery" placeholder="搜索项目" style="width: 200px" clearable @input="loadAllItems" />
            <el-button type="primary" @click="openNewItemDialog">新增项目</el-button>
          </div>
        </div>
      </template>
      <div class="two-panels">
        <div class="panel" v-for="cat in categories" :key="cat.id">
          <div class="panel-header">
            <span class="emoji">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
            <span class="color-badge" :style="{ background: cat.color }"></span>
          </div>
          <el-table :data="itemsByCategory[cat.id] || []" style="width: 100%" size="small" v-loading="loading.items">
            <el-table-column prop="name" label="项目" min-width="180" />
            <el-table-column prop="defaultUnit" label="默认单位" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button text type="primary" @click="recordItem(scope.row)">记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <!-- 活动类别（移到最后） -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>活动类别</span>
          <div class="actions">
            <el-input v-model="categoryQuery" placeholder="搜索类别" style="width: 200px" clearable @input="loadCategories" />
            <el-button type="primary" @click="showCategoryDialog = true">新增类别</el-button>
          </div>
        </div>
      </template>
      <el-table :data="categories" style="width: 100%" size="small" v-loading="loading.categories">
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="scope">
            <span style="font-size: 20px">{{ scope.row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="类别" width="180" />
        <el-table-column prop="color" label="颜色" width="160">
          <template #default="scope">
            <span class="color-badge" :style="{ background: scope.row.color }"></span>
            <span>{{ scope.row.color }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button text @click="selectCategory(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增类别对话框 -->
    <el-dialog v-model="showCategoryDialog" title="新增类别" width="500">
      <el-form :model="categoryForm" label-width="100px">
        <el-form-item label="名称"><el-input v-model="categoryForm.name" /></el-form-item>
        <el-form-item label="图标Emoji"><el-input v-model="categoryForm.icon" placeholder="例如：🏃" /></el-form-item>
        <el-form-item label="颜色"><el-input v-model="categoryForm.color" placeholder="#4CAF50" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog=false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增项目对话框 -->
    <el-dialog v-model="showItemDialog" title="新增项目" width="500">
      <el-form :model="itemForm" label-width="100px">
        <el-form-item label="项目名称"><el-input v-model="itemForm.name" /></el-form-item>
        <el-form-item label="默认单位"><el-input v-model="itemForm.defaultUnit" placeholder="例如：次/分钟" /></el-form-item>
        <el-form-item label="活动类别">
          <el-select v-model="itemForm.categoryId" placeholder="请选择类别">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showItemDialog=false">取消</el-button>
        <el-button type="primary" @click="saveItem" :disabled="!itemForm.categoryId">保存</el-button>
      </template>
    </el-dialog>

    <!-- 记录项目对话框 -->
    <el-dialog v-model="showRecordDialog" title="记录活动" width="500">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="数量"><el-input v-model.number="recordForm.quantity" type="number" min="0" /></el-form-item>
        <el-form-item label="单位"><el-input v-model="recordForm.unit" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="recordForm.notes" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRecordDialog=false">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </template>
    </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import activityApi from '@/api/activity'

const categories = ref([])
const items = ref([])
const summary = ref([])
const selectedCategory = ref(null)
const categoryQuery = ref('')
const itemQuery = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const loading = reactive({ categories: false, items: false, summary: false })

const showCategoryDialog = ref(false)
const showItemDialog = ref(false)
const showRecordDialog = ref(false)
const showAddRecordDialog = ref(false)
const addRecordForm = reactive({ categoryId: null, itemId: null, quantity: 0, unit: '秒', notes: '' })
const addDialogItems = ref([])

const categoryForm = reactive({ name: '', icon: '🏃', color: '#4CAF50' })
const itemForm = reactive({ name: '', defaultUnit: '', categoryId: null })
const recordForm = reactive({ quantity: 1, unit: '', notes: '', itemId: null, categoryId: null })

const loadCategories = async () => {
  loading.categories = true
  try {
    const { data } = await activityApi.searchCategories(categoryQuery.value)
    categories.value = data.data || data
  } finally {
    loading.categories = false
  }
}

// 新增：按类别分组的项目数据
const itemsByCategory = ref({})

// 新增：加载所有类别的项目
const loadAllItems = async () => {
  loading.items = true
  try {
    const grouped = {}
    for (const cat of categories.value) {
      const { data } = await activityApi.searchItems(cat.id, itemQuery.value)
      grouped[cat.id] = data.data || data
    }
    itemsByCategory.value = grouped
  } finally {
    loading.items = false
  }
}

const selectCategory = (cat) => {
  selectedCategory.value = cat
  loadAllItems()
  loadSummary()
}

const loadItems = async () => {
  // 改为无操作，保持兼容（旧逻辑不再使用）
  if (!selectedCategory.value) return
  loading.items = true
  try {
    const { data } = await activityApi.searchItems(selectedCategory.value.id, itemQuery.value)
    items.value = data.data || data
  } finally {
    loading.items = false
  }
}



const openNewItemDialog = () => {
  itemForm.name = ''
  itemForm.defaultUnit = ''
  itemForm.categoryId = selectedCategory.value?.id || null
  showItemDialog.value = true
}

const saveItem = async () => {
  if (!itemForm.categoryId) return
  const payload = { categoryId: itemForm.categoryId, name: itemForm.name, defaultUnit: itemForm.defaultUnit }
  await activityApi.ensureItem(payload)
  showItemDialog.value = false
  await loadAllItems()
}

const recordItem = (item) => {
  showRecordDialog.value = true
  recordForm.unit = item.defaultUnit || ''
  recordForm.notes = ''
  recordForm.quantity = 1
  recordForm.itemId = item.id
  recordForm.categoryId = item.categoryId
}

const recordCountByItem = ref({})
const loadRecordCounts = async () => {
  try {
    const { data } = await activityApi.listRecords({ date: date.value })
    const list = data.data || data
    const counts = {}
    list.forEach(r => {
      const id = r.itemId
      counts[id] = (counts[id] || 0) + 1
    })
    recordCountByItem.value = counts
  } catch (e) {
    recordCountByItem.value = {}
  }
}
const onDateChange = async () => {
  await loadSummary()
  await loadRecordCounts()
}
const saveRecord = async () => {
  const payload = {
    categoryId: recordForm.categoryId,
    itemId: recordForm.itemId,
    date: date.value,
    quantity: recordForm.quantity,
    unit: recordForm.unit,
    notes: recordForm.notes
  }
  await activityApi.createRecord(payload)
  showRecordDialog.value = false
  await loadSummary()
  await loadRecordCounts()
}

const loadSummary = async () => {
  loading.summary = true
  try {
    const { data } = await activityApi.dailySummary(date.value)
    const serverSummary = data.data || data
    // 合并：确保所有类别都有汇总卡片（无记录的类别 items 为空）
    const merged = categories.value.map(cat => {
      const s = serverSummary.find(x => x.categoryId === cat.id)
      if (s) {
        // 用类别的视觉信息覆盖，保证一致性
        return { ...s, categoryId: cat.id, categoryName: cat.name, icon: cat.icon, color: cat.color }
      }
      return { categoryId: cat.id, categoryName: cat.name, icon: cat.icon, color: cat.color, items: [] }
    })
    summary.value = merged
  } finally {
    loading.summary = false
  }
}

const getSvgUrl = (d, catId, style) => {
  return activityApi.getCategoryDailySvgUrl(d, catId, style)
}

onMounted(async () => {
  await loadCategories()
  await loadAllItems()
  await loadSummary()
  await loadRecordCounts()
})

// 保存类别后，重新加载类别和项目
const saveCategory = async () => {
  const { data } = await activityApi.ensureCategory(categoryForm)
  showCategoryDialog.value = false
  await loadCategories()
  await loadAllItems()
  selectedCategory.value = data.data || data
}

const openAddRecordDialog = () => {
  showAddRecordDialog.value = true
  if (categories.value.length > 0) {
    addRecordForm.categoryId = categories.value[0].id
    loadItemsForAddDialog()
  }
}
const loadItemsForAddDialog = async () => {
  if (!addRecordForm.categoryId) return
  const { data } = await activityApi.searchItems(addRecordForm.categoryId, '')
  addDialogItems.value = data.data || data
}
const saveAddDialogRecord = async () => {
  if (!addRecordForm.categoryId || !addRecordForm.itemId) return
  const payload = {
    categoryId: addRecordForm.categoryId,
    itemId: addRecordForm.itemId,
    date: date.value,
    quantity: addRecordForm.quantity,
    unit: addRecordForm.unit,
    notes: addRecordForm.notes
  }
  await activityApi.createRecord(payload)
  showAddRecordDialog.value = false
  await loadSummary()
  await loadRecordCounts()
}
</script>

<style scoped>
.strong-road-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.subtitle { color: #666; }
.section-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 10px; }
.hint { color: #999; padding: 10px; }
.color-badge { display: inline-block; width: 14px; height: 14px; border-radius: 3px; margin-right: 8px; vertical-align: middle; }
.summary-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.summary-item { border: 1px solid #eee; border-radius: 8px; padding: 12px; }
.summary-header { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.emoji { font-size: 22px; }
.svg-preview img { width: 100%; max-width: 540px; border: 1px solid #f0f0f0; border-radius: 6px; }
.two-panels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.panel { border: 1px solid #eee; border-radius: 8px; padding: 12px; overflow: hidden; min-width: 0; display: flex; flex-direction: column; }
.panel-header { font-weight: 600; margin-bottom: 8px; }
/* 防止表格内容撑破卡片宽度，同时让首列自适应填满剩余空间 */
.panel :deep(.el-table) { table-layout: auto; }
.panel :deep(.el-table__cell) { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
</style>