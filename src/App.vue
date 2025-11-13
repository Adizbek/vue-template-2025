<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
import { RouterView } from 'vue-router'

import 'vue-sonner/style.css'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
    <Toaster rich-colors />
    <RouterView />
  </div>
</template>
