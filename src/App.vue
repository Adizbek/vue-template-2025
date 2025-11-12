<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
import { RouterView } from 'vue-router'

import 'vue-sonner/style.css'
</script>

<template>
  <Toaster rich-colors />

  <RouterView />
</template>
