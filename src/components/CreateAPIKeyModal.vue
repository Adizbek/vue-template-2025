<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-black bg-opacity-25" @click="$emit('update:open', false)"></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ keyToEdit ? 'Edit API Key' : 'Create API Key' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="My API Key"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Optional description"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Max Concurrent Requests
            </label>
            <input
              v-model.number="form.max_concurrent_requests"
              type="number"
              min="1"
              max="100"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div class="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              @click="$emit('update:open', false)"
              class="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isLoading" class="flex-1">
              {{ isLoading ? 'Saving...' : (keyToEdit ? 'Update' : 'Create') }}
            </Button>
          </div>
        </form>

        <div v-if="createdKey" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm font-medium text-green-800 mb-2">API Key Created!</p>
          <code class="text-xs bg-white p-2 rounded block break-all">{{ createdKey }}</code>
          <p class="text-xs text-green-700 mt-2">Save this key securely. You won't be able to see it again.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import apiClient from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import type { APIKey } from '@/types'

const props = defineProps<{
  open: boolean
  keyToEdit?: APIKey | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const form = ref({
  name: '',
  description: '',
  max_concurrent_requests: 5,
})

const isLoading = ref(false)
const createdKey = ref<string | null>(null)

watch(() => props.keyToEdit, (key) => {
  if (key) {
    form.value = {
      name: key.name,
      description: key.description || '',
      max_concurrent_requests: key.max_concurrent_requests,
    }
  } else {
    form.value = {
      name: '',
      description: '',
      max_concurrent_requests: 5,
    }
  }
  createdKey.value = null
})

async function handleSubmit() {
  isLoading.value = true

  try {
    if (props.keyToEdit) {
      await apiClient.put(`/api-keys/${props.keyToEdit.id}`, form.value)
      toast.success('API key updated successfully')
      emit('success')
      emit('update:open', false)
    } else {
      const { data } = await apiClient.post('/api-keys', form.value)
      createdKey.value = data.key
      toast.success('API key created successfully')
      emit('success')
    }
  } catch (error: any) {
    console.error('Failed to save API key:', error)
    toast.error(error.response?.data?.detail || 'Failed to save API key')
  } finally {
    isLoading.value = false
  }
}
</script>

