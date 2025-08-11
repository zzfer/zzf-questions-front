<template>
  <div class="frontend-display">
    <el-row :gutter="20">
      <!-- 左侧：题目展示区域 -->
      <el-col :span="16">
        <el-card shadow="hover" v-if="currentQuestion">
          <template #header>
            <div class="question-header">
              <span class="question-number">第 {{ currentQuestionIndex + 1 }} 题</span>
              <div class="question-meta">
                <el-tag size="small" type="primary">{{ getTypeLabel(currentQuestion.type) }}</el-tag>
                <el-tag size="small" type="warning">{{ getDifficultyLabel(currentQuestion.difficulty) }}</el-tag>
                <el-tag size="small" type="success">{{ currentQuestion.category }}</el-tag>
                <span class="question-score">{{ currentQuestion.score }}分</span>
              </div>
            </div>
          </template>
          
          <div class="question-content">
            <h3 class="question-title">{{ currentQuestion.title }}</h3>
            <div class="question-description">{{ currentQuestion.content }}</div>
            
            <!-- 题目选项 -->
            <div class="question-options" v-if="currentQuestion.options">
              <div 
                v-for="option in currentQuestion.options" 
                :key="option.id"
                class="option-item"
                :class="{ 'selected': selectedAnswers.includes(option.id), 'correct': showAnswer && option.isCorrect, 'incorrect': showAnswer && selectedAnswers.includes(option.id) && !option.isCorrect }"
                @click="selectOption(option)"
              >
                <span class="option-label">{{ option.optionLabel }}.</span>
                <span class="option-content">{{ option.optionContent }}</span>
                <el-icon v-if="showAnswer && option.isCorrect" class="correct-icon"><Check /></el-icon>
              </div>
            </div>
            
            <!-- 答案解析 -->
            <div v-if="showAnswer && currentQuestion.explanation" class="answer-explanation">
              <h4>答案解析：</h4>
              <p>{{ currentQuestion.explanation }}</p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="question-actions">
              <el-button @click="showAnswerToggle" :type="showAnswer ? 'warning' : 'success'">
                {{ showAnswer ? '隐藏答案' : '显示答案' }}
              </el-button>
              <el-button @click="nextQuestion" type="primary" :disabled="currentQuestionIndex >= questions.length - 1">
                下一题
              </el-button>
              <el-button @click="prevQuestion" :disabled="currentQuestionIndex <= 0">
                上一题
              </el-button>
              <el-button @click="getRandomQuestion" type="info">随机题目</el-button>
            </div>
          </div>
        </el-card>
        
        <!-- 没有题目时的提示 -->
        <el-card v-else shadow="hover">
          <el-empty description="暂无题目数据">
            <el-button @click="loadQuestions" type="primary">加载题目</el-button>
          </el-empty>
        </el-card>
      </el-col>
      
      <!-- 右侧：题目筛选和列表 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>题目筛选</span>
              <el-button @click="loadQuestions" size="small" type="primary">刷新</el-button>
            </div>
          </template>
          
          <!-- 筛选条件 -->
          <el-form :model="filterParams" size="small" label-width="60px">
            <el-form-item label="类型">
              <el-select v-model="filterParams.type" placeholder="选择类型" clearable style="width: 100%">
                <el-option label="单选题" value="SINGLE_CHOICE"></el-option>
                <el-option label="多选题" value="MULTIPLE_CHOICE"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度">
              <el-select v-model="filterParams.difficulty" placeholder="选择难度" clearable style="width: 100%">
                <el-option label="简单" value="EASY"></el-option>
                <el-option label="中等" value="MEDIUM"></el-option>
                <el-option label="困难" value="HARD"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="分类">
              <el-input v-model="filterParams.category" placeholder="输入分类" clearable></el-input>
            </el-form-item>
            
            <el-form-item label="搜索">
              <el-input v-model="filterParams.keyword" placeholder="搜索关键词" clearable></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button @click="applyFilter" type="primary" size="small" style="width: 100%">应用筛选</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 题目列表 -->
        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <span>题目列表 ({{ questions.length }}题)</span>
          </template>
          
          <div class="questions-sidebar">
            <div 
              v-for="(question, index) in questions" 
              :key="question.id" 
              class="question-sidebar-item"
              :class="{ 'active': index === currentQuestionIndex }"
              @click="selectQuestion(index)"
            >
              <div class="sidebar-question-title">{{ index + 1 }}. {{ question.title }}</div>
              <div class="sidebar-question-meta">
                <el-tag size="mini">{{ getTypeLabel(question.type) }}</el-tag>
                <el-tag size="mini" type="warning">{{ getDifficultyLabel(question.difficulty) }}</el-tag>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <el-pagination
            v-if="total > pageSize"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="total"
            size="small"
            class="sidebar-pagination">
          </el-pagination>
        </el-card>
        
        <!-- 统计信息 -->
        <el-card shadow="hover" style="margin-top: 20px;">
          <template #header>
            <span>统计信息</span>
          </template>
          
          <div v-if="statistics" class="statistics">
            <div class="stat-item">
              <span class="stat-label">总题目数：</span>
              <span class="stat-value">{{ statistics.totalQuestions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">单选题：</span>
              <span class="stat-value">{{ statistics.typeStatistics?.SINGLE_CHOICE || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">多选题：</span>
              <span class="stat-value">{{ statistics.typeStatistics?.MULTIPLE_CHOICE || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">简单：</span>
              <span class="stat-value">{{ statistics.difficultyStatistics?.EASY || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">中等：</span>
              <span class="stat-value">{{ statistics.difficultyStatistics?.MEDIUM || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">困难：</span>
              <span class="stat-value">{{ statistics.difficultyStatistics?.HARD || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { publicApi } from '../api/questions'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

export default {
  name: 'FrontendDisplay',
  components: {
    Check
  },
  setup() {
    const questions = ref([])
    const currentQuestionIndex = ref(0)
    const selectedAnswers = ref([])
    const showAnswer = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const statistics = ref(null)
    
    // 筛选参数
    const filterParams = reactive({
      type: '',
      difficulty: '',
      category: '',
      keyword: '',
      page: 0,
      size: 20
    })
    
    // 当前题目
    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value] || null
    })
    
    // 加载题目列表
    const loadQuestions = async () => {
      try {
        const params = {
          ...filterParams,
          page: currentPage.value - 1,
          size: pageSize.value
        }
        // 过滤空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })
        
        const response = await publicApi.getActiveQuestions(params)
        questions.value = response.data.content || []
        total.value = response.data.totalElements || 0
        
        // 如果当前索引超出范围，重置为0
        if (currentQuestionIndex.value >= questions.value.length) {
          currentQuestionIndex.value = 0
        }
        
        resetAnswerState()
      } catch (error) {
        ElMessage.error(error.message || '加载题目失败')
      }
    }
    
    // 加载统计信息
    const loadStatistics = async () => {
      try {
        const response = await publicApi.getStatistics()
        statistics.value = response.data
      } catch (error) {
        console.error('加载统计信息失败:', error)
      }
    }
    
    // 选择选项
    const selectOption = (option) => {
      if (showAnswer.value) return // 显示答案时不允许选择
      
      if (currentQuestion.value.type === 'SINGLE_CHOICE') {
        // 单选题：只能选择一个
        selectedAnswers.value = [option.id]
      } else {
        // 多选题：可以选择多个
        const index = selectedAnswers.value.indexOf(option.id)
        if (index > -1) {
          selectedAnswers.value.splice(index, 1)
        } else {
          selectedAnswers.value.push(option.id)
        }
      }
    }
    
    // 显示/隐藏答案
    const showAnswerToggle = () => {
      showAnswer.value = !showAnswer.value
    }
    
    // 下一题
    const nextQuestion = () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++
        resetAnswerState()
      }
    }
    
    // 上一题
    const prevQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
        resetAnswerState()
      }
    }
    
    // 选择指定题目
    const selectQuestion = (index) => {
      currentQuestionIndex.value = index
      resetAnswerState()
    }
    
    // 随机获取题目
    const getRandomQuestion = async () => {
      try {
        const response = await publicApi.getRandomQuestions({ count: 1 })
        if (response.data && response.data.length > 0) {
          const randomQuestion = response.data[0]
          // 找到该题目在列表中的索引
          const index = questions.value.findIndex(q => q.id === randomQuestion.id)
          if (index !== -1) {
            selectQuestion(index)
          } else {
            // 如果随机题目不在当前列表中，添加到列表开头
            questions.value.unshift(randomQuestion)
            selectQuestion(0)
          }
        }
      } catch (error) {
        ElMessage.error(error.message || '获取随机题目失败')
      }
    }
    
    // 应用筛选
    const applyFilter = () => {
      currentPage.value = 1
      filterParams.page = 0
      loadQuestions()
    }
    
    // 分页处理
    const handlePageChange = (newPage) => {
      currentPage.value = newPage
      filterParams.page = newPage - 1
      loadQuestions()
    }
    
    // 重置答题状态
    const resetAnswerState = () => {
      selectedAnswers.value = []
      showAnswer.value = false
    }
    
    // 标签转换函数
    const getTypeLabel = (type) => {
      const map = { SINGLE_CHOICE: '单选题', MULTIPLE_CHOICE: '多选题' }
      return map[type] || type
    }
    
    const getDifficultyLabel = (difficulty) => {
      const map = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }
      return map[difficulty] || difficulty
    }
    
    onMounted(() => {
      loadQuestions()
      loadStatistics()
    })
    
    return {
      questions,
      currentQuestion,
      currentQuestionIndex,
      selectedAnswers,
      showAnswer,
      currentPage,
      pageSize,
      total,
      statistics,
      filterParams,
      loadQuestions,
      selectOption,
      showAnswerToggle,
      nextQuestion,
      prevQuestion,
      selectQuestion,
      getRandomQuestion,
      applyFilter,
      handlePageChange,
      getTypeLabel,
      getDifficultyLabel
    }
  }
}
</script>

<style scoped>
.frontend-display {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-number {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-score {
  color: #f56c6c;
  font-weight: bold;
}

.question-content {
  padding: 20px 0;
}

.question-title {
  font-size: 20px;
  margin-bottom: 15px;
  color: #303133;
}

.question-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #606266;
}

.question-options {
  margin: 20px 0;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 10px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.option-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.option-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.option-item.correct {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.option-item.incorrect {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
  color: #409eff;
  min-width: 30px;
}

.option-content {
  flex: 1;
}

.correct-icon {
  color: #67c23a;
  margin-left: 10px;
}

.answer-explanation {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.answer-explanation h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.answer-explanation p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.question-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.questions-sidebar {
  max-height: 400px;
  overflow-y: auto;
}

.question-sidebar-item {
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.question-sidebar-item:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
}

.question-sidebar-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.sidebar-question-title {
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-question-meta {
  display: flex;
  gap: 5px;
}

.sidebar-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.statistics {
  font-size: 14px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #909399;
}

.stat-value {
  color: #409eff;
  font-weight: bold;
}
</style>