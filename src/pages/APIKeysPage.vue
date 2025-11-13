<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        <Button @click="showCreateModal = true" class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          Create API Key
        </Button>
      </div>

      <div v-if="apiKeys && apiKeys.length > 0" class="grid gap-4">
        <Card
          v-for="key in apiKeys"
          :key="key.id"
          class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CardTitle class="text-gray-900 dark:text-white">{{ key.name }}</CardTitle>
                <Badge :variant="key.is_active ? 'default' : 'secondary'">
                  {{ key.is_active ? 'Active' : 'Inactive' }}
                </Badge>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="viewKey(key)">
                  View
                </Button>
                <Button variant="outline" size="sm" @click="editKey(key)">
                  Edit
                </Button>
                <Button variant="outline" size="sm" @click="deleteKey(key)" class="text-red-600 dark:text-red-400">
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ key.description }}</p>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              <code class="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md text-gray-900 dark:text-gray-100 font-mono">
                {{ key.key_preview }}
              </code>
              <span class="text-gray-600 dark:text-gray-400">
                Max concurrent: <span class="font-medium text-gray-900 dark:text-white">{{ key.max_concurrent_requests }}</span>
              </span>
              <span v-if="key.last_used_at" class="text-gray-600 dark:text-gray-400">
                Last used: <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(key.last_used_at) }}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card v-else class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
        <CardContent class="text-center py-12 text-gray-500 dark:text-gray-400">
          No API keys yet. Create one to get started!
        </CardContent>
      </Card>
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

