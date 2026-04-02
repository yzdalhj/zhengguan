<template>
  <div class="flex items-center gap-1">
    <button
      v-for="star in 5"
      :key="star"
      @click="!readonly && handleRate(star)"
      class="transition-transform hover:scale-110"
      :class="{ 'cursor-pointer': !readonly, 'cursor-default': readonly }"
    >
      <Icon
        :name="star <= currentRating ? 'heroicons:star-solid' : 'heroicons:star'"
        class="w-5 h-5 transition-colors"
        :class="[
          star <= currentRating ? 'text-amber-400' : 'text-(--text-muted)',
          star <= hoverRating && !readonly ? 'text-amber-300' : '',
        ]"
        @mouseenter="!readonly && (hoverRating = star)"
        @mouseleave="!readonly && (hoverRating = 0)"
      />
    </button>
    <span v-if="showCount && count > 0" class="text-xs text-(--text-muted) ml-1">({{ count }})</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  count?: number
  readonly?: boolean
  showCount?: boolean
}>(), {
  modelValue: 0,
  count: 0,
  readonly: false,
  showCount: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  rate: [value: number]
}>()

const hoverRating = ref(0)

const currentRating = computed(() => {
  return hoverRating.value || props.modelValue
})

const handleRate = (value: number) => {
  emit('update:modelValue', value)
  emit('rate', value)
}
</script>
