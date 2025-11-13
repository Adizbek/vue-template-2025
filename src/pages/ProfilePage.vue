<template>
  <Layout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p class="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <div class="space-y-2">
              <Label for="full_name">Full Name</Label>
              <Input
                id="full_name"
                v-model="form.full_name"
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            <div class="flex justify-end pt-4">
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const isLoading = ref(false)
const form = ref({
  email: '',
  full_name: '',
})

onMounted(() => {
  if (authStore.user) {
    form.value.email = authStore.user.email
    form.value.full_name = authStore.user.full_name || ''
  }
})

async function handleSubmit() {
  isLoading.value = true
  try {
    await apiClient.put('/users/profile', form.value)
    await authStore.fetchUser()
    toast.success('Profile updated successfully')
  } catch (error: unknown) {
    console.error('Failed to update profile:', error)
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
      : undefined
    toast.error(errorMessage || 'Failed to update profile')
  } finally {
    isLoading.value = false
  }
}
</script>

