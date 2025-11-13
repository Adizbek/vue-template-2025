<template>
  <div v-if="open && apiKey" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-black bg-opacity-25" @click="$emit('update:open', false)"></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">API Key Details</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p class="text-sm text-gray-900">{{ apiKey.name }}</p>
          </div>

          <div v-if="apiKey.description">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p class="text-sm text-gray-900">{{ apiKey.description }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <div class="flex items-center space-x-2">
              <code class="flex-1 text-xs bg-gray-100 p-2 rounded break-all">
                {{ showFullKey ? apiKey.key : apiKey.key_preview }}
              </code>
              <Button size="sm" variant="outline" @click="toggleKey">
                {{ showFullKey ? 'Hide' : 'Show' }}
              </Button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span
              :class="apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              {{ apiKey.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Requests</label>
            <p class="text-sm text-gray-900">{{ apiKey.max_concurrent_requests }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
            <p class="text-sm text-gray-900">{{ formatDate(apiKey.created_at) }}</p>
          </div>

          <div v-if="apiKey.last_used_at">
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Used</label>
            <p class="text-sm text-gray-900">{{ formatDate(apiKey.last_used_at) }}</p>
          </div>

          <Button @click="$emit('update:open', false)" class="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import type { APIKey } from '@/types'

defineProps<{
  open: boolean
  apiKey?: APIKey | null
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()

const showFullKey = ref(false)

function toggleKey() {
  showFullKey.value = !showFullKey.value
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

