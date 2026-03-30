<template>
  <Icon :name="iconName" :size="size" v-bind="$attrs" />
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  size?: string
}>()

const iconName = computed(() => {
  const map: Record<string, string> = {
    'home': 'heroicons:home',
    'time': 'heroicons:clock',
    'view-list': 'heroicons:list-bullet',
    'tag': 'heroicons:tag',
    'search': 'heroicons:magnifying-glass',
    'sunny': 'heroicons:sun',
    'moon': 'heroicons:moon',
    'star': 'heroicons:star',
    'heart': 'heroicons:heart',
    'heart-filled': 'heroicons:heart-solid',
    'logout': 'heroicons:arrow-right-on-rectangle',
    'close': 'heroicons:x-mark',
    'app': 'heroicons:squares-2x2',
    'jump': 'heroicons:arrow-top-right-on-square',
    'info-circle': 'heroicons:information-circle',
    'browse': 'heroicons:eye',
    'thumb-up': 'heroicons:hand-thumb-up',
    'user': 'heroicons:user',
    'copy': 'heroicons:document-duplicate',
    'video-off': 'heroicons:video-camera-slash',
    'play-circle': 'heroicons:play-circle',
    'play': 'heroicons:play',
    'chevron-left': 'heroicons:chevron-left',
    'chevron-right': 'heroicons:chevron-right',
    'logo-github': 'simple-icons:github',
    'logo-bilibili': 'simple-icons:bilibili',
    'logo-youtube': 'simple-icons:youtube',
  }
  return map[props.name] || props.name
})
</script>
