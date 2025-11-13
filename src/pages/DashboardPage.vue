<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <!-- Balance Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Current Balance</p>
              <p class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatCurrency(authStore.user?.balance || 0) }}
              </p>
            </div>
            <Button @click="showTopupModal = true">
              Top Up Balance
            </Button>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div v-if="stats" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.total_requests }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">TTS Requests</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.tts_requests }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">STT Requests</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.stt_requests }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p6">
            <dt class="text-sm font-medium text-gray-500 truncate">Total Cost (30 days)</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatCurrency(stats.total_cost) }}
            </dd>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div v-if="recentLogs && recentLogs.length > 0" class="space-y-3">
            <div
              v-for="log in recentLogs"
              :key="log.id"
              class="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div class="flex items-center space-x-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="log.service_type === 'tts' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                >
                  {{ log.service_type.toUpperCase() }}
                </span>
                <span class="text-sm text-gray-600">
                  {{ log.service_type === 'tts' ? `${log.character_count} chars` : `${Math.ceil((log.duration_seconds || 0) / 60)}min` }}
                </span>
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
            No recent activity
          </div>
        </div>
      </div>
    </div>

    <!-- Top-up Modal -->
    <TopupModal v-model:open="showTopupModal" @success="handleTopupSuccess" />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Button } from '@/components/ui/button'
import TopupModal from '@/components/TopupModal.vue'
import type { UsageStats, UsageLog } from '@/types'

const authStore = useAuthStore()
const stats = ref<UsageStats | null>(null)
const recentLogs = ref<UsageLog[]>([])
const showTopupModal = ref(false)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' UZS'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchStats() {
  try {
    const { data } = await apiClient.get('/usage/stats')
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

async function fetchRecentLogs() {
  try {
    const { data } = await apiClient.get('/usage', { params: { limit: 10 } })
    recentLogs.value = data.logs
  } catch (error) {
    console.error('Failed to fetch recent logs:', error)
  }
}

function handleTopupSuccess() {
  authStore.fetchUser()
  showTopupModal.value = false
}

onMounted(() => {
  fetchStats()
  fetchRecentLogs()
})
</script>

