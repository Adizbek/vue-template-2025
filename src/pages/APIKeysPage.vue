<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">API Keys</h1>
        <Button @click="showCreateModal = true">
          Create API Key
        </Button>
      </div>

      <div v-if="apiKeys && apiKeys.length > 0" class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="key in apiKeys" :key="key.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3">
                  <h3 class="text-lg font-medium text-gray-900">{{ key.name }}</h3>
                  <span
                    :class="key.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ key.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-500">{{ key.description }}</p>
                <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <code class="bg-gray-100 px-2 py-1 rounded">{{ key.key_preview }}</code>
                  <span>Max concurrent: {{ key.max_concurrent_requests }}</span>
                  <span v-if="key.last_used_at">
                    Last used: {{ formatDate(key.last_used_at) }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <Button variant="outline" size="sm" @click="viewKey(key)">
                  View
                </Button>
                <Button variant="outline" size="sm" @click="editKey(key)">
                  Edit
                </Button>
                <Button variant="outline" size="sm" @click="deleteKey(key)">
                  Delete
                </Button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No API keys yet. Create one to get started!
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <CreateAPIKeyModal
      v-model:open="showCreateModal"
      :key-to-edit="selectedKey"
      @success="handleKeyCreated"
    />

    <!-- View Key Modal -->
    <ViewAPIKeyModal v-model:open="showViewModal" :api-key="selectedKey" />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Button } from '@/components/ui/button'
import CreateAPIKeyModal from '@/components/CreateAPIKeyModal.vue'
import ViewAPIKeyModal from '@/components/ViewAPIKeyModal.vue'
import type { APIKey } from '@/types'
import { toast } from 'vue-sonner'

const apiKeys = ref<APIKey[]>([])
const showCreateModal = ref(false)
const showViewModal = ref(false)
const selectedKey = ref<APIKey | null>(null)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function fetchAPIKeys() {
  try {
    const { data } = await apiClient.get('/api-keys')
    apiKeys.value = data
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    toast.error('Failed to load API keys')
  }
}

function viewKey(key: APIKey) {
  selectedKey.value = key
  showViewModal.value = true
}

function editKey(key: APIKey) {
  selectedKey.value = key
  showCreateModal.value = true
}

async function deleteKey(key: APIKey) {
  if (!confirm(`Are you sure you want to delete "${key.name}"?`)) return

  try {
    await apiClient.delete(`/api-keys/${key.id}`)
    toast.success('API key deleted successfully')
    fetchAPIKeys()
  } catch (error) {
    console.error('Failed to delete API key:', error)
    toast.error('Failed to delete API key')
  }
}

function handleKeyCreated() {
  showCreateModal.value = false
  selectedKey.value = null
  fetchAPIKeys()
}

onMounted(() => {
  fetchAPIKeys()
})
</script>

