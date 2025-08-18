import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:9090',
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
    return response
  },
  error => {
    console.error('API错误:', error)
    throw new Error('请求失败')
  }
)

export default api