<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'

import 'vue-sonner/style.css'

// Initialize theme on app mount
const themeStore = useThemeStore()
</script>

<template>
  <Toaster rich-colors />

  <RouterView />
</template>
