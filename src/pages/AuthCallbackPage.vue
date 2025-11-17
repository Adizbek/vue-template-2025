<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 dark:from-background dark:via-background/80 dark:to-primary/20 px-6">
    <Card class="w-full max-w-lg border border-border/80 bg-card/95 text-foreground shadow-xl shadow-black/10 dark:shadow-black/30">
      <CardHeader class="space-y-2 text-center">
        <CardTitle class="text-xl">Completing authentication...</CardTitle>
        <p class="text-sm text-muted-foreground">Hang tight while we secure your session.</p>
      </CardHeader>
      <CardContent class="flex flex-col items-center gap-4 pb-8">
        <div class="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  const accessToken = route.query.access_token as string
  const refreshToken = route.query.refresh_token as string

  if (accessToken && refreshToken) {
    authStore.handleOAuthCallback(accessToken, refreshToken)
    router.push('/')
  } else {
    router.push('/login')
  }
})
</script>

