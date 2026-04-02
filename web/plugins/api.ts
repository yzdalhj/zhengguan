import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class ApiClient {
  private client: AxiosInstance

  constructor() {
    const config = useRuntimeConfig()
    
    this.client = axios.create({
      baseURL: config.public.apiBase,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // 打印请求日志
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        
        // Add auth token if available
        if (process.client) {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        const message = error.response?.data?.error || error.message || '请求失败'
        return Promise.reject({
          error: message,
          status: error.response?.status,
          required_level: error.response?.data?.required_level,
        })
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete(url, config)
  }
}

export default defineNuxtPlugin(() => {
  const api = new ApiClient()

  return {
    provide: {
      api,
    },
  }
})
