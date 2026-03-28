type ColorTheme = 'dark' | 'light'

export function useColorTheme() {
  // 从客户端插件已经设置好的 class 推断初始主题
  const getInitialTheme = (): ColorTheme => {
    if (import.meta.client) {
      // 检查 document 上已有的主题 class
      if (document.documentElement.classList.contains('dark')) return 'dark'
      if (document.documentElement.classList.contains('light')) return 'light'
    }
    return 'dark'
  }

  const colorTheme = useState<ColorTheme>('color-theme', getInitialTheme)

  const isDark = computed(() => colorTheme.value === 'dark')
  const isLight = computed(() => colorTheme.value === 'light')

  const setTheme = (theme: ColorTheme) => {
    colorTheme.value = theme
    updateDocumentTheme(theme)
  }

  const toggleTheme = () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const updateDocumentTheme = (theme: ColorTheme) => {
    if (import.meta.client) {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(theme)
    }
  }

  // 监听主题变化并保存到 localStorage
  watch(colorTheme, (newTheme) => {
    if (import.meta.client) {
      localStorage.setItem('color-theme', newTheme)
    }
  })

  return {
    colorTheme: readonly(colorTheme),
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  }
}
