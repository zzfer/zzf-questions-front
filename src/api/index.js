import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:9090',
  timeout: 10000
})

// 仅为写操作设置 JSON Content-Type，避免 GET 请求触发不必要的 CORS 预检
api.defaults.headers.post['Content-Type'] = 'application/json'
api.defaults.headers.put['Content-Type'] = 'application/json'
api.defaults.headers.patch['Content-Type'] = 'application/json'

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