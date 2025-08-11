import api from './index'

// 后台管理API
export const adminApi = {
  // 创建题目
  createQuestion(data) {
    return api.post('/api/admin/questions', data)
  },
  
  // 获取题目列表（分页）
  getQuestions(params) {
    return api.get('/api/admin/questions', { params })
  },
  
  // 获取题目详情
  getQuestionById(id) {
    return api.get(`/api/admin/questions/${id}`)
  },
  
  // 更新题目
  updateQuestion(id, data) {
    return api.put(`/api/admin/questions/${id}`, data)
  },
  
  // 删除题目
  deleteQuestion(id) {
    return api.delete(`/api/admin/questions/${id}`)
  },
  
  // 获取统计信息
  getStatistics() {
    return api.get('/api/admin/questions/statistics')
  },
  
  // 批量删除题目
  batchDeleteQuestions(ids) {
    return api.delete('/api/admin/questions/batch', { data: ids })
  }
}

// 前台展示API
export const publicApi = {
  // 获取激活题目列表（分页）
  getActiveQuestions(params) {
    return api.get('/api/public/questions', { params })
  },
  
  // 获取题目详情
  getQuestionById(id) {
    return api.get(`/api/public/questions/${id}`)
  },
  
  // 随机获取题目
  getRandomQuestions(params) {
    return api.get('/api/public/questions/random', { params })
  },
  
  // 随机获取考试题目（不含答案）
  getRandomExamQuestions(params) {
    return api.get('/api/public/questions/exam/random', { params })
  },
  
  // 获取题目答案和解析
  getQuestionAnswer(id) {
    return api.get(`/api/public/questions/${id}/answer`)
  },
  
  // 获取统计信息
  getStatistics() {
    return api.get('/api/public/questions/statistics')
  }
}