type ColorTheme = 'dark' | 'light'

export function useColorTheme() {
  const colorTheme = useState<ColorTheme>('color-theme', () => 'dark')

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

  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('color-theme') as ColorTheme | null
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
      setTheme(initialTheme)
    }
  }

  watch(colorTheme, (newTheme) => {
    if (import.meta.client) {
      localStorage.setItem('color-theme', newTheme)
    }
  })

  onMounted(() => {
    initTheme()
  })

  return {
    colorTheme: readonly(colorTheme),
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  }
}
