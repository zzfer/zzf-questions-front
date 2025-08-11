import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8082',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const { data } = response
    if (data.code === 200) {
      return data
    } else {
      throw new Error(data.message || '请求失败')
    }
  },
  error => {
    console.error('API错误:', error)
    throw error
  }
)

export default api