<template>
  <div class="house-calculator">
    <el-row :gutter="20" justify="center">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h2>房产价值计算器</h2>
              <p class="subtitle">根据年租金和租金回报率计算房产实际价值</p>
            </div>
          </template>
          
          <el-form :model="form" :rules="rules" ref="calculatorForm" label-width="120px" size="large">
            <el-form-item label="月租金" prop="monthlyRent">
              <el-input
                v-model.number="form.monthlyRent"
                placeholder="请输入月租金（元）"
                type="number"
                :min="0"
                clearable
                @input="calculateAnnualRent"
              >
                <template #suffix>元/月</template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="年租金" prop="annualRent">
              <el-input
                v-model.number="form.annualRent"
                placeholder="请输入年租金（元）"
                type="number"
                :min="0"
                clearable
                @input="calculateMonthlyRent"
              >
                <template #suffix>元/年</template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="房产价格" prop="housePrice">
              <el-input
                v-model.number="form.housePrice"
                placeholder="请输入房产价格（元）"
                type="number"
                :min="0"
                clearable
              >
                <template #suffix>元</template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="租金回报率" prop="rentYieldRate">
              <el-input
                v-model.number="form.rentYieldRate"
                placeholder="请输入租金回报率（%）"
                type="number"
                :min="0"
                :max="100"
                :step="0.1"
                clearable
              >
                <template #suffix>%</template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-button type="primary" @click="calculateHouseValue" :loading="calculating" size="large" style="width: 100%">
                    计算房产价值
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button type="success" @click="calculateYieldRate" :loading="calculating" size="large" style="width: 100%">
                    计算租金回报率
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
          
          <!-- 计算结果 -->
          <div v-if="result.show" class="result-section">
            <el-divider>计算结果</el-divider>
            
            <!-- 房产价值计算结果 -->
            <el-alert
              v-if="result.calculationType === 'house_value'"
              :title="`房产实际价值：${formatNumber(result.houseValue)} 元`"
              type="success"
              :closable="false"
              show-icon
              class="result-alert"
            >
              <template #default>
                <div class="calculation-details">
                  <p><strong>计算公式：</strong>年租金 ÷ 租金回报率 = 房产实际价值</p>
                  <p><strong>详细计算：</strong>{{ formatNumber(form.annualRent) }} ÷ {{ form.rentYieldRate }}% = {{ formatNumber(result.houseValue) }} 元</p>
                  <p v-if="form.monthlyRent"><strong>月租金：</strong>{{ formatNumber(form.monthlyRent) }} 元/月</p>
                </div>
              </template>
            </el-alert>
            
            <!-- 租金回报率计算结果 -->
            <el-alert
              v-if="result.calculationType === 'yield_rate'"
              :title="`租金回报率：${result.calculatedYieldRate.toFixed(2)}%`"
              type="info"
              :closable="false"
              show-icon
              class="result-alert"
            >
              <template #default>
                <div class="calculation-details">
                  <p><strong>计算公式：</strong>年租金 ÷ 房产价格 × 100% = 租金回报率</p>
                  <p><strong>详细计算：</strong>{{ formatNumber(form.annualRent) }} ÷ {{ formatNumber(form.housePrice) }} × 100% = {{ result.calculatedYieldRate.toFixed(2) }}%</p>
                  <p v-if="form.monthlyRent"><strong>月租金：</strong>{{ formatNumber(form.monthlyRent) }} 元/月</p>
                </div>
              </template>
            </el-alert>
          </div>
          
          <!-- 计算历史 -->
          <div v-if="history.length > 0" class="history-section">
            <el-divider>计算历史</el-divider>
            <el-table :data="history" size="small" stripe>
              <el-table-column prop="calculationType" label="计算类型" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.calculationType === 'house_value'" type="success" size="small">房产价值</el-tag>
                  <el-tag v-else-if="scope.row.calculationType === 'yield_rate'" type="info" size="small">回报率</el-tag>
                  <el-tag v-else type="warning" size="small">房产价值</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="monthlyRent" label="月租金" width="100">
                <template #default="scope">
                  {{ scope.row.monthlyRent ? formatNumber(scope.row.monthlyRent) + '元' : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="annualRent" label="年租金" width="110">
                <template #default="scope">
                  {{ formatNumber(scope.row.annualRent) }}元
                </template>
              </el-table-column>
              <el-table-column prop="housePrice" label="房产价格" width="120">
                <template #default="scope">
                  {{ scope.row.housePrice ? formatNumber(scope.row.housePrice) + '元' : (scope.row.houseValue ? formatNumber(scope.row.houseValue) + '元' : '-') }}
                </template>
              </el-table-column>
              <el-table-column prop="rentYieldRate" label="回报率" width="80">
                <template #default="scope">
                  {{ scope.row.rentYieldRate ? scope.row.rentYieldRate + '%' : (scope.row.calculatedYieldRate ? scope.row.calculatedYieldRate.toFixed(2) + '%' : '-') }}
                </template>
              </el-table-column>
              <el-table-column prop="timestamp" label="计算时间" width="140">
                <template #default="scope">
                  {{ formatDate(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60">
                <template #default="scope">
                  <el-button @click="removeHistory(scope.$index)" type="danger" size="small" text>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="history-actions">
              <el-button @click="clearHistory" type="warning" size="small">
                清空历史
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'HouseValueCalculator',
  setup() {
    const calculatorForm = ref(null)
    const calculating = ref(false)
    
    const form = reactive({
      monthlyRent: null,
      annualRent: null,
      housePrice: null,
      rentYieldRate: null
    })
    
    const result = reactive({
      show: false,
      houseValue: 0,
      calculatedYieldRate: 0,
      calculationType: '' // 'house_value' or 'yield_rate'
    })
    
    const history = ref([])
    
    const rules = {
      monthlyRent: [
        { type: 'number', min: 1, message: '月租金必须大于0', trigger: 'blur' }
      ],
      annualRent: [
        { type: 'number', min: 1, message: '年租金必须大于0', trigger: 'blur' }
      ],
      housePrice: [
        { type: 'number', min: 1, message: '房产价格必须大于0', trigger: 'blur' }
      ],
      rentYieldRate: [
        { type: 'number', min: 0.1, max: 100, message: '租金回报率必须在0.1%-100%之间', trigger: 'blur' }
      ]
    }
    
    // 月租金与年租金相互转换
    const calculateAnnualRent = () => {
      if (form.monthlyRent && form.monthlyRent > 0) {
        form.annualRent = form.monthlyRent * 12
      }
    }
    
    const calculateMonthlyRent = () => {
      if (form.annualRent && form.annualRent > 0) {
        form.monthlyRent = Math.round(form.annualRent / 12)
      }
    }
    
    // 计算房产价值
    const calculateHouseValue = async () => {
      if (!form.annualRent || !form.rentYieldRate) {
        ElMessage.warning('请输入年租金和租金回报率')
        return
      }
      
      try {
        calculating.value = true
        
        // 模拟计算延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 计算房产价值：年租金 ÷ 租金回报率
        const houseValue = form.annualRent / (form.rentYieldRate / 100)
        
        result.houseValue = houseValue
        result.calculationType = 'house_value'
        result.show = true
        
        // 同步更新房产价格字段
        form.housePrice = Math.round(houseValue)
        
        // 添加到历史记录
        history.value.unshift({
          monthlyRent: form.monthlyRent,
          annualRent: form.annualRent,
          rentYieldRate: form.rentYieldRate,
          houseValue: houseValue,
          calculationType: 'house_value',
          timestamp: new Date()
        })
        
        // 限制历史记录数量
        if (history.value.length > 10) {
          history.value = history.value.slice(0, 10)
        }
        
        ElMessage.success('房产价值计算完成！')
        
      } catch (error) {
        ElMessage.error('计算失败，请检查输入数据')
      } finally {
        calculating.value = false
      }
    }
    
    // 计算租金回报率
    const calculateYieldRate = async () => {
      if (!form.annualRent || !form.housePrice) {
        ElMessage.warning('请输入年租金和房产价格')
        return
      }
      
      try {
        calculating.value = true
        
        // 模拟计算延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 计算租金回报率：年租金 ÷ 房产价格 × 100%
        const yieldRate = (form.annualRent / form.housePrice) * 100
        
        result.calculatedYieldRate = yieldRate
        result.calculationType = 'yield_rate'
        result.show = true
        
        // 同步更新租金回报率字段
        form.rentYieldRate = Math.round(yieldRate * 100) / 100
        
        // 添加到历史记录
        history.value.unshift({
          monthlyRent: form.monthlyRent,
          annualRent: form.annualRent,
          housePrice: form.housePrice,
          calculatedYieldRate: yieldRate,
          calculationType: 'yield_rate',
          timestamp: new Date()
        })
        
        // 限制历史记录数量
        if (history.value.length > 10) {
          history.value = history.value.slice(0, 10)
        }
        
        ElMessage.success('租金回报率计算完成！')
        
      } catch (error) {
        ElMessage.error('计算失败，请检查输入数据')
      } finally {
        calculating.value = false
      }
    }
    
    const formatNumber = (num) => {
      if (num == null) return '0'
      return new Intl.NumberFormat('zh-CN').format(Math.round(num))
    }
    
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
    
    const removeHistory = (index) => {
      history.value.splice(index, 1)
      ElMessage.success('已删除历史记录')
    }
    
    const clearHistory = () => {
      history.value = []
      ElMessage.success('已清空历史记录')
    }
    
    return {
      calculatorForm,
      calculating,
      form,
      result,
      history,
      rules,
      calculateAnnualRent,
      calculateMonthlyRent,
      calculateHouseValue,
      calculateYieldRate,
      formatNumber,
      formatDate,
      removeHistory,
      clearHistory
    }
  }
}
</script>

<style scoped>
.house-calculator {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: bold;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.result-section {
  margin-top: 30px;
}

.result-alert {
  font-size: 16px;
}

.calculation-details {
  margin-top: 10px;
}

.calculation-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #67c23a;
}

.history-section {
  margin-top: 30px;
}

.history-actions {
  margin-top: 10px;
  text-align: center;
}

:deep(.el-form-item__label) {
  font-weight: bold;
  color: #2c3e50;
}

:deep(.el-input__inner) {
  font-size: 16px;
}

:deep(.el-button--primary) {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(45deg, #66b1ff, #85ce61);
}

:deep(.el-card) {
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

:deep(.el-alert--success) {
  border-radius: 10px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}
</style>