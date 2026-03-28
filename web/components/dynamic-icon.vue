<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
// 动态图标组件 - 使用 unplugin-icons 按需加载
const props = defineProps<{
  name: string
  size?: string
}>()

// 图标名称映射到 unplugin-icons 组件名
const iconNameMap: Record<string, string> = {
  'home': 'IconHeroiconsHome',
  'time': 'IconHeroiconsClock',
  'view-list': 'IconHeroiconsListBullet',
  'tag': 'IconHeroiconsTag',
  'search': 'IconHeroiconsMagnifyingGlass',
  'sunny': 'IconHeroiconsSun',
  'moon': 'IconHeroiconsMoon',
  'star': 'IconHeroiconsStar',
  'heart': 'IconHeroiconsHeart',
  'heart-filled': 'IconHeroiconsHeartSolid',
  'logout': 'IconHeroiconsArrowRightOnRectangle',
  'close': 'IconHeroiconsXMark',
  'app': 'IconHeroiconsSquares2x2',
  'jump': 'IconHeroiconsArrowTopRightOnSquare',
  'info-circle': 'IconHeroiconsInformationCircle',
  'browse': 'IconHeroiconsEye',
  'thumb-up': 'IconHeroiconsHandThumbUp',
  'user': 'IconHeroiconsUser',
  'copy': 'IconHeroiconsDocumentDuplicate',
  'video-off': 'IconHeroiconsVideoCameraSlash',
  'play-circle': 'IconHeroiconsPlayCircle',
  'play': 'IconHeroiconsPlay',
  'chevron-left': 'IconHeroiconsChevronLeft',
  'chevron-right': 'IconHeroiconsChevronRight',
  'logo-github': 'IconSimpleIconsGithub',
  'logo-bilibili': 'IconSimpleIconsBilibili',
  'logo-youtube': 'IconSimpleIconsYoutube',
}

const iconComponent = computed(() => {
  const componentName = iconNameMap[props.name]
  return componentName || null
})
</script>
