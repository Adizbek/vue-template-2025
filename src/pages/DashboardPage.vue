<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <!-- Balance Card -->
      <Card class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle class="text-gray-600 dark:text-gray-400 text-base font-medium">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between">
            <p class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(authStore.user?.balance || 0) }}
            </p>
            <Button @click="showTopupModal = true" class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Top Up Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Stats Grid -->
      <div v-if="stats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.total_requests }}</p>
          </CardContent>
        </Card>

        <Card class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">TTS Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.tts_requests }}</p>
          </CardContent>
        </Card>

        <Card class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">STT Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.stt_requests }}</p>
          </CardContent>
        </Card>

        <Card class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(stats.total_cost) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activity -->
      <Card class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle class="text-gray-900 dark:text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="recentLogs && recentLogs.length > 0" class="space-y-3">
            <div
              v-for="log in recentLogs"
              :key="log.id"
              class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div class="flex items-center space-x-3">
                <Badge
                  :variant="log.service_type === 'tts' ? 'default' : 'secondary'"
                  class="font-medium"
                >
                  {{ log.service_type.toUpperCase() }}
                </Badge>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ log.service_type === 'tts' ? `${log.character_count} chars` : `${Math.ceil((log.duration_seconds || 0) / 60)}min` }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(log.cost) }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(log.created_at) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        </CardContent>
      </Card>
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

