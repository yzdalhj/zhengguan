import { defineStore } from 'pinia'
import type { User } from '~/types'

interface UserState {
  user: User | null
  token: string | null
  loading: boolean
  bannerClosed: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    loading: false,
    bannerClosed: false,
  }),

  getters: {
    isAuthenticated: state => !!state.token && !!state.user,
    isAdmin: state => state.user?.role === 'admin',
  },

  actions: {
    setToken(token: string) {
      this.token = token
      if (process.client) {
        localStorage.setItem('token', token)
      }
    },

    clearToken() {
      this.token = null
      this.user = null
      if (process.client) {
        localStorage.removeItem('token')
      }
    },

    async login(email: string, password: string) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const response = await $api.post('/auth/login', { email, password })
        this.setToken(response.data.token)
        this.user = response.data.user
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginByPhone(phone: string, password: string) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const response = await $api.post('/auth/login/phone', { phone, password })
        this.setToken(response.data.token)
        this.user = response.data.user
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(username: string, email: string, password: string, phone?: string) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const data: Record<string, string> = { username, email, password }
        if (phone) {
          data.phone = phone
        }
        const response = await $api.post('/auth/register', data)
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async getMe() {
      const { $api } = useNuxtApp()
      if (!this.token) return
      
      try {
        const response = await $api.get('/auth/me')
        this.user = response.data
      } catch (error) {
        this.clearToken()
        throw error
      }
    },

    logout() {
      this.clearToken()
    },

    async updatePassword(currentPassword: string, newPassword: string) {
      const { $api } = useNuxtApp()
      try {
        await $api.put('/auth/password', {
          currentPassword,
          newPassword,
        })
        return { success: true }
      } catch (error) {
        throw error
      }
    },

    // 从 localStorage 恢复 token
    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('token')
        if (token) {
          this.token = token
          this.getMe()
        }
        const bannerClosed = localStorage.getItem('bannerClosed')
        if (bannerClosed) {
          this.bannerClosed = bannerClosed === 'true'
        }
      }
    },

    // 关闭横幅
    closeBanner() {
      this.bannerClosed = true
      if (process.client) {
        localStorage.setItem('bannerClosed', 'true')
      }
    }
  },
})
