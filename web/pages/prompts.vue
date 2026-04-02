<template>
  <div>
    <!-- 吸顶筛选 -->
    <div class="sticky top-14 z-40 bg-(--bg-secondary) border-b border-(--border-color)">
      <!-- 已选标签 -->
      <div v-if="promptStore.filters.selectedTags.length > 0 || promptStore.filters.tool || promptStore.filters.difficulty" class="px-5 py-3 border-b border-(--border-color) bg-(--bg-primary)/50">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-sm text-(--text-secondary) shrink-0">已选：</span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in selectedTags"
              :key="tag.id"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {{ tag.name }}
              <button @click="removeTag(tag.id)" class="hover:text-primary-hover transition-colors">
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
              </button>
            </span>
            <span
              v-if="promptStore.filters.tool"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {{ toolLabel }}
              <button @click="promptStore.filters.tool = undefined; promptStore.fetchPrompts(1)" class="hover:text-primary-hover transition-colors">
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
              </button>
            </span>
            <span
              v-if="promptStore.filters.difficulty"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {{ difficultyLabel }}
              <button @click="promptStore.filters.difficulty = undefined; promptStore.fetchPrompts(1)" class="hover:text-primary-hover transition-colors">
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
          <button
            @click="clearAll"
            class="text-xs text-(--text-secondary) hover:text-red-400 transition-colors shrink-0 ml-auto"
          >
            清除全部
          </button>
        </div>
      </div>

      <!-- 筛选区 -->
      <div class="relative pb-8">
        <div
          class="overflow-hidden transition-all duration-500 ease-in-out"
          :class="filtersExpanded ? 'max-h-512 opacity-100' : 'max-h-0 opacity-0'"
        >
          <div class="px-5 py-4">
            <!-- 快捷筛选行 -->
            <div class="flex items-center gap-3 mb-4 flex-wrap">
              <!-- 工具筛选 -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-(--text-primary) shrink-0">工具</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="tool in filterOptions?.tools"
                    :key="tool.value"
                    @click="selectTool(tool.value)"
                    class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                    :class="promptStore.filters.tool === tool.value
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated)'"
                  >
                    {{ tool.label }}
                  </button>
                </div>
              </div>

              <!-- 分隔 -->
              <div class="w-px h-5 bg-(--border-color)" />

              <!-- 难度筛选 -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-(--text-primary) shrink-0">难度</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="diff in filterOptions?.difficulties"
                    :key="diff.value"
                    @click="selectDifficulty(diff.value)"
                    class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                    :class="promptStore.filters.difficulty === diff.value
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated)'"
                  >
                    {{ diff.label }}
                  </button>
                </div>
              </div>

              <!-- 分隔 -->
              <div class="w-px h-5 bg-(--border-color)" />

              <!-- 排序 -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-(--text-primary) shrink-0">排序</span>
                <select
                  v-model="promptStore.filters.sort"
                  @change="promptStore.fetchPrompts(1)"
                  class="text-xs bg-(--bg-primary) text-(--text-primary) border border-(--border-color) rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="created_at_desc">最新发布</option>
                  <option value="rating_desc">最高评分</option>
                  <option value="copy_count_desc">最多复制</option>
                </select>
              </div>
            </div>

            <!-- 标签筛选 -->
            <div v-if="promptTags.length > 0" class="space-y-3">
              <div v-for="(tags, category) in groupedTags" :key="category" class="flex items-start gap-3">
                <span class="text-sm font-medium text-(--text-primary) min-w-16 shrink-0 pt-1">{{ category }}</span>
                <div class="flex-1 flex flex-wrap gap-1.5">
                  <button
                    v-for="tag in tags"
                    :key="tag.id"
                    @click="promptStore.toggleTag(tag.id); promptStore.fetchPrompts(1)"
                    class="px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                    :class="promptStore.filters.selectedTags.includes(tag.id)
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated)'"
                  >
                    {{ tag.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 展开/收起按钮 -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            @click="filtersExpanded = !filtersExpanded"
            class="flex items-center gap-1.5 px-4 py-2 bg-(--bg-elevated) border border-(--border-color) rounded-full text-xs text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-primary) transition-all duration-200 shadow-md group"
          >
            <Icon
              :name="filtersExpanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
              class="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
            />
            <span>{{ filtersExpanded ? '收起筛选' : '展开筛选' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 数量统计 -->
    <div class="px-5 pt-4">
      <p class="text-sm text-(--text-secondary)">
        共 <span class="text-primary font-semibold">{{ promptStore.total }}</span> 个提示词
      </p>
    </div>

    <!-- 提示词网格 -->
    <div v-if="!promptStore.loading && promptStore.prompts.length > 0" class="p-5 pt-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
        <prompt-card
          v-for="prompt in promptStore.prompts"
          :key="prompt.id"
          :prompt="prompt"
        />
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-else-if="promptStore.loading" class="p-5 pt-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
        <div v-for="i in 14" :key="i" class="bg-(--bg-elevated) rounded-lg overflow-hidden shadow-sm">
          <div class="aspect-4/3 bg-(--bg-secondary) animate-pulse"></div>
          <div class="p-2 space-y-1.5">
            <div class="h-3 bg-(--bg-secondary) rounded animate-pulse"></div>
            <div class="h-3 bg-(--bg-secondary) rounded w-3/4 animate-pulse"></div>
            <div class="flex gap-1.5 pt-0.5">
              <div class="h-2 bg-(--bg-secondary) rounded w-12 animate-pulse"></div>
              <div class="h-2 bg-(--bg-secondary) rounded w-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center p-5 pt-4">
      <div class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-(--bg-secondary) flex items-center justify-center">
          <Icon name="heroicons:sparkles" size="40" />
        </div>
        <h3 class="text-xl font-semibold text-(--text-primary) mb-2">暂无提示词</h3>
        <p class="text-(--text-secondary) mb-6">尝试调整筛选条件</p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1 && !promptStore.loading" class="flex items-center justify-center gap-2 p-5 pt-4 pb-8">
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 text-sm rounded-lg transition-colors"
        :class="currentPage === 1 ? 'text-(--text-muted) cursor-not-allowed' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
      >首页</button>
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 text-sm rounded-lg transition-colors"
        :class="currentPage === 1 ? 'text-(--text-muted) cursor-not-allowed' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
      ><Icon name="heroicons:chevron-left" size="16" /></button>
      <div class="flex items-center gap-1">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="goToPage(page)"
          class="w-9 h-9 text-sm font-medium rounded-lg transition-colors"
          :class="currentPage === page ? 'bg-primary text-white' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
        >{{ page }}</button>
      </div>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 text-sm rounded-lg transition-colors"
        :class="currentPage === totalPages ? 'text-(--text-muted) cursor-not-allowed' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
      ><Icon name="heroicons:chevron-right" size="16" /></button>
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 text-sm rounded-lg transition-colors"
        :class="currentPage === totalPages ? 'text-(--text-muted) cursor-not-allowed' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'"
      >尾页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Tag } from '~/types'

useHead({
  title: 'AI提示词库',
  meta: [
    { name: 'description', content: '浏览优质AI视频生成提示词，支持按工具、难度、风格多维度筛选。每一条提示词都经过实测验证。' }
  ]
})

const promptStore = usePromptStore()
const filterOptions = ref<any>(null)
const filtersExpanded = ref(false)

const currentPage = computed(() => promptStore.currentPage)
const totalPages = computed(() => promptStore.totalPages)

// 过滤出提示词分类标签（排除工具和难度分类）
const promptTags = computed(() => {
  if (!filterOptions.value?.tagsByCategory) return []
  const tags: Tag[] = []
  for (const [category, tagsList] of Object.entries(filterOptions.value.tagsByCategory)) {
    if (!['适用工具', '难度'].includes(category) && Array.isArray(tagsList)) {
      ;(tagsList as Tag[]).forEach(t => tags.push(t))
    }
  }
  return tags
})

const groupedTags = computed(() => {
  const groups: Record<string, any[]> = {}
  if (!filterOptions.value?.tagsByCategory) return groups
  for (const [category, tagsList] of Object.entries(filterOptions.value.tagsByCategory)) {
    if (!['适用工具', '难度'].includes(category) && Array.isArray(tagsList)) {
      groups[category] = tagsList as any[]
    }
  }
  return groups
})

const selectedTags = computed(() => {
  if (!promptTags.value || !promptStore.filters.selectedTags) return []
  return promptTags.value.filter(t => promptStore.filters.selectedTags.includes(t.id))
})

const toolLabel = computed(() => {
  const tool = filterOptions.value?.tools?.find((t: any) => t.value === promptStore.filters.tool)
  return tool?.label || ''
})

const difficultyLabel = computed(() => {
  const diff = filterOptions.value?.difficulties?.find((d: any) => d.value === promptStore.filters.difficulty)
  return diff?.label || ''
})

const displayedPages = computed(() => {
  const pages: number[] = []
  const maxVisible = 7
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const selectTool = (tool: string) => {
  promptStore.filters.tool = promptStore.filters.tool === tool ? undefined : tool
  promptStore.fetchPrompts(1)
}

const selectDifficulty = (diff: string) => {
  promptStore.filters.difficulty = promptStore.filters.difficulty === diff ? undefined : diff
  promptStore.fetchPrompts(1)
}

const removeTag = (tagId: number) => {
  promptStore.toggleTag(tagId)
  promptStore.fetchPrompts(1)
}

const clearAll = () => {
  promptStore.clearFilters()
  promptStore.fetchPrompts(1)
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  promptStore.fetchPrompts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  const options = await promptStore.fetchFilterOptions()
  filterOptions.value = options
  await promptStore.fetchPrompts(1)
})
</script>
