<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background/80 dark:to-primary/15 py-12 px-4 sm:px-6 lg:px-8">
    <Card class="max-w-md w-full bg-card/95 border border-border/80 shadow-xl shadow-black/10 dark:shadow-black/30 backdrop-blur-lg">
      <CardHeader class="space-y-1 text-center">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          NeuronAI
        </h1>
        <CardTitle class="text-2xl text-foreground">
          Create your account
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          Or
          <router-link to="/login" class="font-medium text-primary hover:text-primary/80">
            sign in to existing account
          </router-link>
        </p>
      </CardHeader>

      <CardContent class="space-y-6">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="full-name">Full Name</Label>
            <Input
              id="full-name"
              v-model="form.full_name"
              type="text"
              autocomplete="name"
              placeholder="Enter your full name"
            />
          </div>

          <div class="space-y-2">
            <Label for="email">Email address</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="Create a password"
            />
          </div>

          <div v-if="error" class="text-sm text-destructive-foreground bg-destructive/15 border border-destructive/30 rounded-md px-3 py-2 text-center">
            {{ error }}
          </div>

          <Button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium shadow-sm hover:shadow-md"
          >
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </Button>
        </form>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            :as="'a'"
            :href="googleOAuthUrl"
            class="w-full"
          >
            Google
          </Button>
          <Button
            variant="outline"
            :as="'a'"
            :href="githubOAuthUrl"
            class="w-full"
          >
            GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  full_name: '',
})

const error = ref('')
const isLoading = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const googleOAuthUrl = computed(() => `${API_URL}/api/v1/auth/oauth/google`)
const githubOAuthUrl = computed(() => `${API_URL}/api/v1/auth/oauth/github`)

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

