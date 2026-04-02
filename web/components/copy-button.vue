<template>
  <button
    @click="handleCopy"
    :disabled="loading"
    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
    :class="[
      copied
        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
        : 'bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20 active:scale-95',
      loading ? 'opacity-60 cursor-not-allowed' : '',
      sizeClass,
    ]"
  >
    <Icon
      :name="copied ? 'heroicons:check' : (loading ? 'heroicons:arrow-path' : 'heroicons:clipboard-document')"
      class="w-4 h-4"
      :class="{ 'animate-spin': loading }"
    />
    <span>{{ copied ? '已复制' : (loading ? '获取中...' : label) }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  promptId: number
  requiredLevel?: string
  label?: string
  size?: 'sm' | 'md'
}>(), {
  label: '复制提示词',
  size: 'md',
  requiredLevel: 'free',
})

const emit = defineEmits<{
  copied: []
  needVip: [level: string]
}>()

const promptStore = usePromptStore()
const copied = ref(false)
const loading = ref(false)

const sizeClass = computed(() => {
  return props.size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
})

const handleCopy = async () => {
  if (copied.value || loading.value) return

  loading.value = true
  try {
    const result = await promptStore.copyPrompt(props.promptId)
    if (result.error) {
      emit('needVip', result.required_level || 'vip')
      return
    }

    // 复制到剪贴板
    await navigator.clipboard.writeText(result.content)
    copied.value = true
    emit('copied')

    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Copy failed:', error)
  } finally {
    loading.value = false
  }
}
</script>
