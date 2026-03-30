import { defineStore } from 'pinia'
import type { Video, Tag } from '~/types'

interface VideoState {
  videos: Video[]
  tags: Tag[]
  loading: boolean
  currentPage: number
  totalPages: number
  total: number
  filters: {
    keyword: string
    selectedTags: number[]
    minDuration?: number
    maxDuration?: number
    platform?: string
    sort: string
  }
  currentVideo: Video | null
}

export const useVideoStore = defineStore('video', {
  state: (): VideoState => ({
    videos: [],
    tags: [],
    loading: false,
    currentPage: 1,
    totalPages: 0,
    total: 0,
    filters: {
      keyword: '',
      selectedTags: [],
      sort: 'created_at_desc',
    },
    currentVideo: null,
  }),

  getters: {
    hasMore: state => state.currentPage < state.totalPages,
  },

  actions: {
    async fetchVideos(page: number = 1) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const params: any = {
          page,
          limit: 20,
          keyword: this.filters.keyword || undefined,
          tags: this.filters.selectedTags.length > 0 ? this.filters.selectedTags : undefined,
          min_duration: this.filters.minDuration,
          max_duration: this.filters.maxDuration,
          platform: this.filters.platform,
          sort: this.filters.sort,
        }

        if (this.filters.selectedTags.length === 0) {
          delete params.tags
        }

        const response = await $api.get('/videos', { params })
        this.videos = response.data
        this.currentPage = page
        this.total = response.pagination?.total || 0
        this.totalPages = response.pagination?.totalPages || 0
      } catch (error) {
        console.error('Failed to fetch videos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchVideoById(id: number) {
      const { $api } = useNuxtApp()
      try {
        const response = await $api.get(`/videos/${id}`)
        this.currentVideo = response.data
        return response.data
      } catch (error) {
        console.error('Failed to fetch video:', error)
        throw error
      }
    },

    async fetchTags(category?: string) {
      const { $api } = useNuxtApp()
      try {
        const url = category ? `/tags?category=${category}` : '/tags'
        const response = await $api.get(url)
        this.tags = response.data
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    },

    setKeyword(keyword: string) {
      this.filters.keyword = keyword
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
      this.filters.minDuration = undefined
      this.filters.maxDuration = undefined
      this.filters.platform = undefined
    },

    async loadMore() {
      if (!this.hasMore || this.loading) return
      
      const { $api } = useNuxtApp()
      const nextPage = this.currentPage + 1
      this.loading = true
      
      try {
        const params: any = {
          page: nextPage,
          limit: 20,
          keyword: this.filters.keyword || undefined,
          tags: this.filters.selectedTags.length > 0 ? this.filters.selectedTags : undefined,
          min_duration: this.filters.minDuration,
          max_duration: this.filters.maxDuration,
          platform: this.filters.platform,
          sort: this.filters.sort,
        }
        
        if (this.filters.selectedTags.length === 0) {
          delete params.tags
        }
        
        const response = await $api.get('/videos', { params })
        this.videos.push(...response.data)
        this.currentPage = nextPage
        this.total = response.pagination?.total || 0
        this.totalPages = response.pagination?.totalPages || 0
      } catch (error) {
        console.error('Failed to load more videos:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
