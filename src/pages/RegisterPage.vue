<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
    <Card class="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-2xl">
      <CardHeader class="space-y-1 text-center">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          NeuronAI
        </h1>
        <CardTitle class="text-2xl text-gray-900 dark:text-white">
          Create your account
        </CardTitle>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Or
          <router-link to="/login" class="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            sign in to existing account
          </router-link>
        </p>
      </CardHeader>

      <CardContent class="space-y-6">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <label for="full-name" class="text-sm font-medium text-gray-900 dark:text-white">
              Full Name
            </label>
            <input
              id="full-name"
              v-model="form.full_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-gray-900 dark:text-white">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password"
            />
          </div>

          <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {{ error }}
          </div>

          <Button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
          >
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </Button>
        </form>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
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

