<template>
  <div class="admin-panel">
    <el-row :gutter="20">
      <!-- 左侧：题目创建表单 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ isEditing ? '编辑题目' : '创建题目' }}</span>
              <el-button v-if="isEditing" @click="resetForm" size="small">取消编辑</el-button>
            </div>
          </template>
          
          <el-form :model="questionForm" :rules="rules" ref="questionFormRef" label-width="80px">
            <el-form-item label="题目标题" prop="title">
              <el-input v-model="questionForm.title" placeholder="请输入题目标题"></el-input>
            </el-form-item>
            
            <el-form-item label="题目内容" prop="content">
              <el-input type="textarea" v-model="questionForm.content" :rows="3" placeholder="请输入题目内容"></el-input>
            </el-form-item>
            
            <el-form-item label="题目类型" prop="type">
              <el-select v-model="questionForm.type" placeholder="请选择题目类型" style="width: 100%">
                <el-option label="单选题" value="SINGLE_CHOICE"></el-option>
                <el-option label="多选题" value="MULTIPLE_CHOICE"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度等级" prop="difficulty">
              <el-select v-model="questionForm.difficulty" placeholder="请选择难度等级" style="width: 100%">
                <el-option label="简单" value="EASY"></el-option>
                <el-option label="中等" value="MEDIUM"></el-option>
                <el-option label="困难" value="HARD"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="分类" prop="category">
              <el-input v-model="questionForm.category" placeholder="请输入题目分类"></el-input>
            </el-form-item>
            
            <el-form-item label="分数" prop="score">
              <el-input-number v-model="questionForm.score" :min="1" :max="10" style="width: 100%"></el-input-number>
            </el-form-item>
            
            <el-form-item label="状态" prop="status">
              <el-select v-model="questionForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="ACTIVE"></el-option>
                <el-option label="禁用" value="INACTIVE"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="选项设置" prop="options">
              <div class="options-container">
                <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                  <el-row :gutter="10" align="middle">
                    <el-col :span="3">
                      <el-input v-model="option.optionLabel" placeholder="标签"></el-input>
                    </el-col>
                    <el-col :span="12">
                      <el-input v-model="option.optionContent" placeholder="选项内容"></el-input>
                    </el-col>
                    <el-col :span="4">
                      <el-checkbox v-model="option.isCorrect">正确答案</el-checkbox>
                    </el-col>
                    <el-col :span="3">
                      <el-button @click="removeOption(index)" size="small" type="danger">删除</el-button>
                    </el-col>
                  </el-row>
                </div>
                <el-button @click="addOption" type="primary" size="small" style="margin-top: 10px;">添加选项</el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="答案解析" prop="explanation">
              <el-input type="textarea" v-model="questionForm.explanation" :rows="3" placeholder="请输入答案解析"></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="loading">
                {{ isEditing ? '更新题目' : '创建题目' }}
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 右侧：题目列表 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>题目列表</span>
              <el-button @click="loadQuestions" size="small">刷新</el-button>
            </div>
          </template>
          
          <!-- 搜索筛选 -->
          <el-row :gutter="10" class="filter-row">
            <el-col :span="6">
              <el-select v-model="searchParams.type" placeholder="类型" size="small" clearable>
                <el-option label="单选题" value="SINGLE_CHOICE"></el-option>
                <el-option label="多选题" value="MULTIPLE_CHOICE"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="searchParams.difficulty" placeholder="难度" size="small" clearable>
                <el-option label="简单" value="EASY"></el-option>
                <el-option label="中等" value="MEDIUM"></el-option>
                <el-option label="困难" value="HARD"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="searchParams.status" placeholder="状态" size="small" clearable>
                <el-option label="启用" value="ACTIVE"></el-option>
                <el-option label="禁用" value="INACTIVE"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button @click="loadQuestions" type="primary" size="small">搜索</el-button>
            </el-col>
          </el-row>
          
          <!-- 题目列表 -->
          <div class="questions-list">
            <div v-for="question in questions" :key="question.id" class="question-item">
              <div class="question-header">
                <span class="question-title">{{ question.title }}</span>
                <div class="question-actions">
                  <el-button @click="editQuestion(question)" size="small" type="primary">编辑</el-button>
                  <el-button @click="deleteQuestion(question.id)" size="small" type="danger">删除</el-button>
                </div>
              </div>
              <div class="question-meta">
                <el-tag size="small">{{ getTypeLabel(question.type) }}</el-tag>
                <el-tag size="small" type="warning">{{ getDifficultyLabel(question.difficulty) }}</el-tag>
                <el-tag size="small" :type="question.status === 'ACTIVE' ? 'success' : 'info'">
                  {{ getStatusLabel(question.status) }}
                </el-tag>
                <span class="question-category">{{ question.category }}</span>
              </div>
              <div class="question-content">{{ question.content }}</div>
            </div>
          </div>
          
          <!-- 分页 -->
          <el-pagination
            v-if="total > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="pagination">
          </el-pagination>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '../api/questions'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminPanel',
  setup() {
    const questionFormRef = ref()
    const loading = ref(false)
    const isEditing = ref(false)
    const currentEditId = ref(null)
    
    // 题目表单数据
    const questionForm = reactive({
      title: '',
      content: '',
      type: '',
      difficulty: '',
      category: '',
      score: 2,
      explanation: '',
      status: 'ACTIVE',
      options: [
        { optionLabel: 'A', optionContent: '', isCorrect: false, sortOrder: 1 },
        { optionLabel: 'B', optionContent: '', isCorrect: false, sortOrder: 2 }
      ]
    })
    
    // 表单验证规则
    const rules = {
      title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
      content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
      type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
      difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
      category: [{ required: true, message: '请输入分类', trigger: 'blur' }]
    }
    
    // 题目列表相关
    const questions = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    // 搜索参数
    const searchParams = reactive({
      type: '',
      difficulty: '',
      status: '',
      keyword: '',
      page: 0,
      size: 10
    })
    
    // 添加选项
    const addOption = () => {
      const nextLabel = String.fromCharCode(65 + questionForm.options.length) // A, B, C, D...
      questionForm.options.push({
        optionLabel: nextLabel,
        optionContent: '',
        isCorrect: false,
        sortOrder: questionForm.options.length + 1
      })
    }
    
    // 删除选项
    const removeOption = (index) => {
      if (questionForm.options.length > 2) {
        questionForm.options.splice(index, 1)
        // 重新设置排序
        questionForm.options.forEach((option, idx) => {
          option.sortOrder = idx + 1
        })
      } else {
        ElMessage.warning('至少需要两个选项')
      }
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!questionFormRef.value) return
      
      await questionFormRef.value.validate(async (valid) => {
        if (valid) {
          // 验证是否有正确答案
          const hasCorrectAnswer = questionForm.options.some(option => option.isCorrect)
          if (!hasCorrectAnswer) {
            ElMessage.error('请至少设置一个正确答案')
            return
          }
          
          loading.value = true
          try {
            if (isEditing.value) {
              await adminApi.updateQuestion(currentEditId.value, questionForm)
              ElMessage.success('题目更新成功')
            } else {
              await adminApi.createQuestion(questionForm)
              ElMessage.success('题目创建成功')
            }
            resetForm()
            loadQuestions()
          } catch (error) {
            ElMessage.error(error.message || '操作失败')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    // 重置表单
    const resetForm = () => {
      if (questionFormRef.value) {
        questionFormRef.value.resetFields()
      }
      Object.assign(questionForm, {
        title: '',
        content: '',
        type: '',
        difficulty: '',
        category: '',
        score: 2,
        explanation: '',
        status: 'ACTIVE',
        options: [
          { optionLabel: 'A', optionContent: '', isCorrect: false, sortOrder: 1 },
          { optionLabel: 'B', optionContent: '', isCorrect: false, sortOrder: 2 }
        ]
      })
      isEditing.value = false
      currentEditId.value = null
    }
    
    // 编辑题目
    const editQuestion = (question) => {
      Object.assign(questionForm, {
        title: question.title,
        content: question.content,
        type: question.type,
        difficulty: question.difficulty,
        category: question.category,
        score: question.score,
        explanation: question.explanation,
        status: question.status,
        options: question.options || []
      })
      isEditing.value = true
      currentEditId.value = question.id
    }
    
    // 删除题目
    const deleteQuestion = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个题目吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await adminApi.deleteQuestion(id)
        ElMessage.success('删除成功')
        loadQuestions()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '删除失败')
        }
      }
    }
    
    // 加载题目列表
    const loadQuestions = async () => {
      try {
        const params = {
          ...searchParams,
          page: currentPage.value - 1,
          size: pageSize.value
        }
        // 过滤空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })
        
        const response = await adminApi.getQuestions(params)
        questions.value = response.data.content || []
        total.value = response.data.totalElements || 0
      } catch (error) {
        ElMessage.error(error.message || '加载题目列表失败')
      }
    }
    
    // 分页处理
    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      searchParams.size = newSize
      currentPage.value = 1
      loadQuestions()
    }
    
    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      searchParams.page = newPage - 1
      loadQuestions()
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
    
    const getStatusLabel = (status) => {
      const map = { ACTIVE: '启用', INACTIVE: '禁用' }
      return map[status] || status
    }
    
    onMounted(() => {
      loadQuestions()
    })
    
    return {
      questionFormRef,
      loading,
      isEditing,
      questionForm,
      rules,
      questions,
      currentPage,
      pageSize,
      total,
      searchParams,
      addOption,
      removeOption,
      submitForm,
      resetForm,
      editQuestion,
      deleteQuestion,
      loadQuestions,
      handleSizeChange,
      handleCurrentChange,
      getTypeLabel,
      getDifficultyLabel,
      getStatusLabel
    }
  }
}
</script>

<style scoped>
.admin-panel {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.options-container {
  width: 100%;
}

.option-item {
  margin-bottom: 10px;
}

.filter-row {
  margin-bottom: 20px;
}

.questions-list {
  max-height: 600px;
  overflow-y: auto;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #fafafa;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.question-title {
  font-weight: bold;
  font-size: 16px;
}

.question-actions {
  display: flex;
  gap: 5px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.question-category {
  color: #666;
  font-size: 12px;
}

.question-content {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>