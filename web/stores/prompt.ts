import { defineStore } from 'pinia'
import type { Prompt, Tag, PromptFilterOptions } from '~/types'

interface PromptState {
  prompts: Prompt[]
  filterOptions: PromptFilterOptions | null
  loading: boolean
  currentPage: number
  totalPages: number
  total: number
  filters: {
    keyword: string
    selectedTags: number[]
    difficulty?: string
    tool?: string
    required_level?: string
    sort: string
  }
  currentPrompt: Prompt | null
}

export const usePromptStore = defineStore('prompt', {
  state: (): PromptState => ({
    prompts: [],
    filterOptions: null,
    loading: false,
    currentPage: 1,
    totalPages: 0,
    total: 0,
    filters: {
      keyword: '',
      selectedTags: [],
      sort: 'created_at_desc',
    },
    currentPrompt: null,
  }),

  getters: {
    hasMore: state => state.currentPage < state.totalPages,
  },

  actions: {
    async fetchPrompts(page: number = 1) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const params: any = {
          page,
          limit: 20,
          keyword: this.filters.keyword || undefined,
          tags: this.filters.selectedTags.length > 0 ? this.filters.selectedTags : undefined,
          difficulty: this.filters.difficulty,
          tool: this.filters.tool,
          required_level: this.filters.required_level,
          sort: this.filters.sort,
        }

        if (this.filters.selectedTags.length === 0) {
          delete params.tags
        }

        const response = await $api.get('/prompts', { params })
        this.prompts = response.data || []
        this.currentPage = page
        this.total = response.pagination?.total || 0
        this.totalPages = response.pagination?.totalPages || 0
      } catch (error) {
        console.error('Failed to fetch prompts:', error)
        this.prompts = []
        this.total = 0
        this.totalPages = 0
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPromptById(id: number) {
      const { $api } = useNuxtApp()
      try {
        const response = await $api.get(`/prompts/${id}`)
        this.currentPrompt = response.data
        return response.data
      } catch (error) {
        console.error('Failed to fetch prompt:', error)
        throw error
      }
    },

    async fetchFilterOptions() {
      if (this.filterOptions) return this.filterOptions
      const { $api } = useNuxtApp()
      try {
        const response = await $api.get('/prompts/filters')
        this.filterOptions = response.data
        return response.data
      } catch (error) {
        console.error('Failed to fetch filter options:', error)
        // 继续执行，不阻塞主流程
        const defaultOptions = {
          tools: [
            { value: 'runway', label: 'Runway' },
            { value: 'pika', label: 'Pika' },
            { value: 'kling', label: '可灵' },
            { value: 'jimeng', label: '即梦' },
            { value: 'sora', label: 'Sora' },
          ],
          difficulties: [
            { value: 'beginner', label: '新手' },
            { value: 'intermediate', label: '进阶' },
            { value: 'expert', label: '专业' },
          ],
          tagsByCategory: {},
        }
        this.filterOptions = defaultOptions
        return defaultOptions
      }
    },

    async toggleFavorite(promptId: number) {
      const { $api } = useNuxtApp()
      try {
        const response = await $api.post(`/prompts/${promptId}/favorite`)
        // 更新本地状态
        const prompt = this.prompts.find(p => p.id === promptId)
        if (prompt) {
          prompt.is_favorited = response.data.is_favorited
        }
        if (this.currentPrompt?.id === promptId) {
          this.currentPrompt.is_favorited = response.data.is_favorited
        }
        return response
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        throw error
      }
    },

    async copyPrompt(promptId: number): Promise<{ content: string; error?: string; required_level?: string }> {
      const { $api } = useNuxtApp()
      try {
        const response = await $api.get(`/prompts/${promptId}/copy`)
        return { content: response.data.content }
      } catch (error: any) {
        return { content: '', error: error.error || '复制失败', required_level: error.required_level }
      }
    },

    async ratePrompt(promptId: number, rating: number, comment?: string) {
      const { $api } = useNuxtApp()
      try {
        return await $api.post(`/prompts/${promptId}/rate`, { rating, comment })
      } catch (error) {
        console.error('Failed to rate prompt:', error)
        throw error
      }
    },

    async fetchRelatedPrompts(promptId: number): Promise<Prompt[]> {
      const { $api } = useNuxtApp()
      try {
        const response = await $api.get(`/prompts/${promptId}/related`)
        return response.data
      } catch (error) {
        console.error('Failed to fetch related prompts:', error)
        return []
      }
    },

    toggleTag(tagId: number) {
      const index = this.filters.selectedTags.indexOf(tagId)
      if (index > -1) {
        this.filters.selectedTags.splice(index, 1)
      } else {
        this.filters.selectedTags.push(tagId)
      }
    },

    clearFilters() {
      this.filters.keyword = ''
      this.filters.selectedTags = []
      this.filters.difficulty = undefined
      this.filters.tool = undefined
      this.filters.required_level = undefined
    },
  },
})
