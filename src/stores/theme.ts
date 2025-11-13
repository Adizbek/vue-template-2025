import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize theme from localStorage or default to light
  const savedTheme = localStorage.getItem('theme')
  const isDark = ref(savedTheme === 'dark')

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function setTheme(dark: boolean) {
    isDark.value = dark
  }

  // Watch for theme changes and update localStorage and document
  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, { immediate: true })


  return {
    isDark,
    toggleTheme,
    setTheme
  }
})

