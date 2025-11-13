<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Usage Statistics</h1>

      <!-- Stats Overview -->
      <div v-if="stats" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.total_requests }}</dd>
            <dd class="mt-1 text-sm text-gray-500">{{ formatCurrency(stats.total_cost) }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">TTS Usage</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.tts_requests }}</dd>
            <dd class="mt-1 text-sm text-gray-500">
              {{ stats.tts_characters.toLocaleString() }} chars · {{ formatCurrency(stats.tts_cost) }}
            </dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">STT Usage</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.stt_requests }}</dd>
            <dd class="mt-1 text-sm text-gray-500">
              {{ stats.stt_minutes.toFixed(1) }} min · {{ formatCurrency(stats.stt_cost) }}
            </dd>
          </div>
        </div>
      </div>

      <!-- Usage Logs -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Usage Logs</h3>

          <div v-if="logs && logs.length > 0" class="space-y-3">
            <div
              v-for="log in logs"
              :key="log.id"
              class="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div class="flex items-center space-x-4">
                <span
                  :class="log.service_type === 'tts' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ log.service_type.toUpperCase() }}
                </span>
                <span
                  :class="getStatusColor(log.status)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ log.status }}
                </span>
                <div class="text-sm text-gray-600">
                  <span v-if="log.service_type === 'tts'">
                    {{ log.character_count }} chars
                    <span v-if="log.voice_id" class="text-gray-500">· {{ log.voice_id }}</span>
                  </span>
                  <span v-else>
                    {{ Math.ceil((log.duration_seconds || 0) / 60) }} min
                    <span v-if="log.language" class="text-gray-500">· {{ log.language }}</span>
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(log.cost) }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(log.created_at) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-500">
            No usage logs yet
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import type { UsageStats, UsageLog } from '@/types'

const stats = ref<UsageStats | null>(null)
const logs = ref<UsageLog[]>([])

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' UZS'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    rate_limited: 'bg-yellow-100 text-yellow-800',
    insufficient_balance: 'bg-orange-100 text-orange-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

async function fetchStats() {
  try {
    const { data } = await apiClient.get('/usage/stats')
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

async function fetchLogs() {
  try {
    const { data } = await apiClient.get('/usage', { params: { limit: 50 } })
    logs.value = data.logs
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  }
}

onMounted(() => {
  fetchStats()
  fetchLogs()
})
</script>
