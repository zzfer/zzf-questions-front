import api from './index'

const activityApi = {
  // Categories
  searchCategories: (q) => api.get('/api/activity/categories', { params: { q } }),
  createCategory: (data) => api.post('/api/activity/categories', data),
  ensureCategory: (data) => api.post('/api/activity/categories/ensure', data),

  // Items
  searchItems: (categoryId, q) => api.get('/api/activity/items', { params: { categoryId, q } }),
  createItem: (data) => api.post('/api/activity/items', data),
  ensureItem: (data) => api.post('/api/activity/items/ensure', data),

  // Records
  createRecord: (data) => api.post('/api/activity/records', data),
  listRecords: ({ date, categoryId }) => api.get('/api/activity/records', { params: { date, categoryId } }),

  // Summary
  dailySummary: (date) => api.get('/api/activity/summary/daily', { params: { date } }),
  getCategoryDailySvgUrl: (date, categoryId, style = 'classic') => {
    const base = api.defaults.baseURL || ''
    return `${base}/api/activity/summary/daily/${date}/${categoryId}/image.svg?style=${encodeURIComponent(style)}`
  }
}

export default activityApi