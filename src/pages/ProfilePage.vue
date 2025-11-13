<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label for="full_name" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="full_name"
                v-model="form.full_name"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div class="pt-5">
              <div class="flex justify-end">
                <Button type="submit" :disabled="isLoading">
                  {{ isLoading ? 'Saving...' : 'Save Changes' }}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Button } from '@/components/ui/button'
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
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    toast.error(error.response?.data?.detail || 'Failed to update profile')
  } finally {
    isLoading.value = false
  }
}
</script>

