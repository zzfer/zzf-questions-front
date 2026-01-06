import api from './index'

// 资产记录相关API
export const assetRecordApi = {
  // 创建资产记录
  createAssetRecord(data) {
    return api.post('/api/asset-records', data)
  },

  // 获取所有资产记录
  getAllAssetRecords() {
    return api.get('/api/asset-records')
  },

  // 根据ID获取资产记录
  getAssetRecordById(id) {
    return api.get(`/api/asset-records/${id}`)
  },

  // 根据用户ID获取资产记录
  getAssetRecordsByUserId(userId) {
    return api.get(`/api/asset-records/user/${userId}`)
  },

  // 根据用户ID和类型获取资产记录
  getAssetRecordsByUserIdAndType(userId, recordType) {
    return api.get(`/api/asset-records/user/${userId}/type/${recordType}`)
  },

  // 根据用户ID和日期范围获取资产记录
  getAssetRecordsByUserIdAndDateRange(userId, startDate, endDate) {
    return api.get(`/api/asset-records/user/${userId}/date-range`, {
      params: { startDate, endDate }
    })
  },

  // 更新资产记录
  updateAssetRecord(id, data) {
    return api.put(`/api/asset-records/${id}`, data)
  },

  // 删除资产记录
  deleteAssetRecord(id) {
    return api.delete(`/api/asset-records/${id}`)
  },

  // 计算用户总资产
  calculateTotalAssetsByUserId(userId) {
    return api.get(`/api/asset-records/user/${userId}/total-assets`)
  },

  // 计算所有人总资产
  calculateTotalAssetsForAll() {
    return api.get('/api/asset-records/total-assets')
  },

  // 根据筛选条件计算总资产
  calculateTotalAssetsByFilter(recordType, owner, startDate, endDate) {
    const params = {}
    if (recordType) params.recordType = recordType
    if (owner) params.owner = owner
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    return api.get('/api/asset-records/total-assets/filter', { params })
  },

  // 根据筛选条件计算用户总资产
  calculateTotalAssetsByUserIdAndFilter(userId, recordType, owner, startDate, endDate) {
    const params = {}
    if (recordType) params.recordType = recordType
    if (owner) params.owner = owner
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    return api.get(`/api/asset-records/user/${userId}/total-assets/filter`, { params })
  },

  // 根据类型计算用户资产
  calculateAssetsByUserIdAndType(userId, recordType) {
    return api.get(`/api/asset-records/user/${userId}/assets-by-type/${recordType}`)
  },

  // 计算用户月均收入
  calculateMonthlyIncomeByUserId(userId) {
    return api.get(`/api/asset-records/user/${userId}/monthly-income`)
  },

  // 计算所有人月均收入
  calculateTotalMonthlyIncome() {
    return api.get('/api/asset-records/monthly-income')
  },

  // 年底资产预测（指定用户）
  predictYearEndAssets(userId) {
    return api.get(`/api/asset-records/user/${userId}/year-end-prediction`)
  },

  // 年底资产预测（全部用户）
  predictYearEndAssetsForAll() {
    return api.get('/api/asset-records/year-end-prediction')
  },

  // 获取用户最近的资产记录
  getRecentAssetRecords(userId, limit = 10) {
    return api.get(`/api/asset-records/user/${userId}/recent`, {
      params: { limit }
    })
  },

  // 获取当前黄金价格（人民币/克）
  getCurrentGoldPrice() {
    return api.get('/api/gold-price/cny')
  }
}

export default assetRecordApi