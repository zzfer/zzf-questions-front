<template>
  <div class="asset-record-container">
    <div class="header">
      <h2>资产记录管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增记录
        </el-button>
        <el-button @click="showPredictionDialog = true">
          <el-icon><TrendCharts /></el-icon>
          年底预测
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="记录类型">
          <el-select v-model="filterForm.recordType" placeholder="请选择类型" clearable style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="工资" value="salary" />
            <el-option label="奖金" value="bonus" />
            <el-option label="投资" value="investment" />
            <el-option label="黄金" value="gold" />
            <el-option label="公积金" value="provident_fund" />
            <el-option label="存款" value="deposit" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属人">
          <el-select v-model="filterForm.owner" placeholder="请选择所属人" clearable style="width: 120px;">
            <el-option label="全部" value="" />
            <el-option label="苏苏" value="苏苏" />
            <el-option label="飞飞" value="飞飞" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAssetRecords">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ totalAssets }}</div>
              <div class="stat-label">总资产</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ monthlyIncome }}</div>
              <div class="stat-label">月均收入</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ assetRecords.length }}</div>
              <div class="stat-label">记录总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ getRecordTypeCount('investment') }}</div>
              <div class="stat-label">投资项目</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 资产记录列表 -->
    <div class="table-section">
      <el-table
        :data="assetRecords"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="recordType" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getRecordTypeTagType(scope.row.recordType)">
              {{ getRecordTypeLabel(scope.row.recordType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="goldWeight" label="黄金重量(克)" width="120">
          <template #default="scope">
            {{ scope.row.goldWeight || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="annualInterestRate" label="年利率" width="100">
          <template #default="scope">
            {{ scope.row.annualInterestRate ? scope.row.annualInterestRate + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="所属人" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.owner === '苏苏' ? 'success' : 'warning'">
              {{ scope.row.owner || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" />
        <el-table-column prop="recordDate" label="记录日期" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editRecord(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRecord(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="showAddDialog"
      width="600px"
      @close="resetForm"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="120px"
      >
        <el-form-item label="记录类型" prop="recordType">
          <el-select v-model="form.recordType" placeholder="请选择记录类型" @change="onRecordTypeChange">
            <el-option label="工资" value="salary" />
            <el-option label="奖金" value="bonus" />
            <el-option label="投资" value="investment" />
            <el-option label="黄金" value="gold" />
            <el-option label="公积金" value="provident_fund" />
            <el-option label="存款" value="deposit" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属人" prop="owner">
          <el-select v-model="form.owner" placeholder="请选择所属人">
            <el-option label="苏苏" value="苏苏" />
            <el-option label="飞飞" value="飞飞" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="2"
            :min="0"
            placeholder="请输入金额"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 黄金重量字段 -->
        <el-form-item 
          v-if="form.recordType === 'gold'" 
          label="黄金重量(克)" 
          prop="goldWeight"
        >
          <el-input-number
            v-model="form.goldWeight"
            :precision="3"
            :min="0"
            placeholder="请输入黄金重量"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 年利率字段 -->
        <el-form-item 
          v-if="form.recordType === 'investment'" 
          label="年利率(%)" 
          prop="annualInterestRate"
        >
          <el-input-number
            v-model="form.annualInterestRate"
            :precision="2"
            :min="0"
            :max="100"
            placeholder="请输入年利率"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>

        <el-form-item label="记录日期" prop="recordDate">
          <el-date-picker
            v-model="form.recordDate"
            type="date"
            placeholder="请选择记录日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 年底预测对话框 -->
    <el-dialog
      title="年底资产预测"
      v-model="showPredictionDialog"
      width="700px"
    >
      <div v-if="prediction" class="prediction-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">当前总资产</div>
                <div class="prediction-value current">¥{{ prediction.currentTotalAssets.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">预测年底资产</div>
                <div class="prediction-value predicted">¥{{ prediction.predictedYearEndAssets.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="8">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">月均收入</div>
                <div class="prediction-value">¥{{ prediction.monthlyIncome.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">日均支出</div>
                <div class="prediction-value">¥{{ prediction.dailyExpense.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">预期利息收入</div>
                <div class="prediction-value">¥{{ prediction.interestIncome.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">预期剩余收入</div>
                <div class="prediction-value income">¥{{ prediction.expectedIncome.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="prediction-card">
              <div class="prediction-item">
                <div class="prediction-label">预期剩余支出</div>
                <div class="prediction-value expense">¥{{ prediction.expectedExpense.toLocaleString() }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPredictionDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, TrendCharts } from '@element-plus/icons-vue'
import { assetRecordApi } from '../api/assetRecord'

export default {
  name: 'AssetRecord',
  components: {
    Plus,
    TrendCharts
  },
  setup() {
    const loading = ref(false)
    const showAddDialog = ref(false)
    const showPredictionDialog = ref(false)
    const assetRecords = ref([])
    const selectedRecords = ref([])
    const totalAssets = ref(0)
    const monthlyIncome = ref(0)
    const prediction = ref(null)
    const formRef = ref(null)
    const editingRecord = ref(null)

    // 当前用户ID（实际项目中应该从用户状态管理中获取）
    const currentUserId = 1

    // 筛选表单
    const filterForm = reactive({
      recordType: '',
      owner: '',
      dateRange: []
    })

    // 表单数据
    const form = reactive({
      recordType: '',
      owner: '',
      amount: null,
      goldWeight: null,
      annualInterestRate: null,
      description: '',
      recordDate: new Date().toISOString().split('T')[0],
      userId: currentUserId
    })

    // 表单验证规则
    const rules = {
      recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
      owner: [{ required: true, message: '请选择所属人', trigger: 'change' }],
      amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
      recordDate: [{ required: true, message: '请选择记录日期', trigger: 'change' }],
      goldWeight: [
        { 
          validator: (rule, value, callback) => {
            if (form.recordType === 'gold' && (!value || value <= 0)) {
              callback(new Error('黄金记录必须输入重量'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ],
      annualInterestRate: [
        { 
          validator: (rule, value, callback) => {
            if (form.recordType === 'investment' && (!value || value <= 0)) {
              callback(new Error('投资记录必须输入年利率'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ]
    }

    // 计算属性
    const dialogTitle = computed(() => {
      return editingRecord.value ? '编辑资产记录' : '新增资产记录'
    })

    // 获取记录类型标签
    const getRecordTypeLabel = (type) => {
      const typeMap = {
        salary: '工资',
        bonus: '奖金',
        investment: '投资',
        gold: '黄金',
        provident_fund: '公积金',
        deposit: '存款',
        other: '其他'
      }
      return typeMap[type] || type
    }

    // 获取记录类型标签颜色
    const getRecordTypeTagType = (type) => {
      const typeMap = {
        salary: 'success',
        bonus: 'warning',
        investment: 'primary',
        gold: 'warning',
        provident_fund: 'info',
        deposit: 'success',
        other: 'info'
      }
      return typeMap[type] || 'info'
    }

    // 获取指定类型的记录数量
    const getRecordTypeCount = (type) => {
      return assetRecords.value.filter(record => record.recordType === type).length
    }

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    // 记录类型变化处理
    const onRecordTypeChange = () => {
      // 清空相关字段
      if (form.recordType !== 'gold') {
        form.goldWeight = null
      }
      if (form.recordType !== 'investment') {
        form.annualInterestRate = null
      }
    }

    // 加载资产记录
    const loadAssetRecords = async () => {
      try {
        loading.value = true
        let response
        
        // 查询所有记录
        response = await assetRecordApi.getAssetRecordsByUserId(currentUserId)
        let records = response.data || []
        
        // 应用筛选条件
        if (filterForm.recordType) {
          records = records.filter(record => record.recordType === filterForm.recordType)
        }
        
        if (filterForm.owner) {
          records = records.filter(record => record.owner === filterForm.owner)
        }
        
        if (filterForm.dateRange && filterForm.dateRange.length === 2) {
          const startDate = filterForm.dateRange[0]
          const endDate = filterForm.dateRange[1]
          records = records.filter(record => {
            const recordDate = record.recordDate
            return recordDate >= startDate && recordDate <= endDate
          })
        }
        
        assetRecords.value = records
      } catch (error) {
        console.error('加载资产记录失败:', error)
        ElMessage.error('加载资产记录失败')
      } finally {
        loading.value = false
      }
    }

    // 加载统计数据
    const loadStatistics = async () => {
      try {
        const [totalAssetsRes, monthlyIncomeRes] = await Promise.all([
          assetRecordApi.calculateTotalAssetsByUserId(currentUserId),
          assetRecordApi.calculateMonthlyIncomeByUserId(currentUserId)
        ])
        
        totalAssets.value = totalAssetsRes.data || 0
        monthlyIncome.value = monthlyIncomeRes.data || 0
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }

    // 加载年底预测
    const loadPrediction = async () => {
      try {
        const response = await assetRecordApi.predictYearEndAssets(currentUserId)
        prediction.value = response.data
      } catch (error) {
        console.error('加载年底预测失败:', error)
        ElMessage.error('加载年底预测失败')
      }
    }

    // 重置筛选条件
    const resetFilter = () => {
      filterForm.recordType = ''
      filterForm.owner = ''
      filterForm.dateRange = []
      loadAssetRecords()
    }

    // 重置表单
    const resetForm = () => {
      Object.assign(form, {
        recordType: '',
        owner: '',
        amount: null,
        goldWeight: null,
        annualInterestRate: null,
        description: '',
        recordDate: new Date().toISOString().split('T')[0],
        userId: currentUserId
      })
      editingRecord.value = null
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    }

    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        
        if (editingRecord.value) {
          // 编辑
          await assetRecordApi.updateAssetRecord(editingRecord.value.id, form)
          ElMessage.success('更新成功')
        } else {
          // 新增
          await assetRecordApi.createAssetRecord(form)
          ElMessage.success('创建成功')
        }
        
        showAddDialog.value = false
        await loadAssetRecords()
        await loadStatistics()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('操作失败')
      }
    }

    // 编辑记录
    const editRecord = (record) => {
      editingRecord.value = record
      Object.assign(form, {
        recordType: record.recordType,
        owner: record.owner,
        amount: record.amount,
        goldWeight: record.goldWeight,
        annualInterestRate: record.annualInterestRate,
        description: record.description,
        recordDate: record.recordDate,
        userId: record.userId
      })
      showAddDialog.value = true
    }

    // 删除记录
    const deleteRecord = async (record) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除这条资产记录吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await assetRecordApi.deleteAssetRecord(record.id)
        ElMessage.success('删除成功')
        await loadAssetRecords()
        await loadStatistics()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 选择变化处理
    const handleSelectionChange = (selection) => {
      selectedRecords.value = selection
    }

    // 监听预测对话框显示
    const handlePredictionDialog = async () => {
      if (showPredictionDialog.value) {
        await loadPrediction()
      }
    }

    // 组件挂载时加载数据
    onMounted(async () => {
      await loadAssetRecords()
      await loadStatistics()
    })

    // 监听预测对话框
    watch(() => showPredictionDialog.value, handlePredictionDialog)

    return {
      loading,
      showAddDialog,
      showPredictionDialog,
      assetRecords,
      selectedRecords,
      totalAssets,
      monthlyIncome,
      prediction,
      formRef,
      editingRecord,
      filterForm,
      form,
      rules,
      dialogTitle,
      getRecordTypeLabel,
      getRecordTypeTagType,
      getRecordTypeCount,
      formatDateTime,
      onRecordTypeChange,
      loadAssetRecords,
      resetFilter,
      resetForm,
      submitForm,
      editRecord,
      deleteRecord,
      handleSelectionChange
    }
  }
}
</script>

<style scoped>
.asset-record-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-form {
  margin: 0;
}

.statistics-section {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.table-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.prediction-content {
  padding: 10px;
}

.prediction-card {
  text-align: center;
  margin-bottom: 10px;
}

.prediction-item {
  padding: 15px;
}

.prediction-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.prediction-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.prediction-value.current {
  color: #409eff;
}

.prediction-value.predicted {
  color: #67c23a;
}

.prediction-value.income {
  color: #67c23a;
}

.prediction-value.expense {
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>