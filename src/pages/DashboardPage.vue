<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      <!-- Balance Card -->
      <Card class="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle class="text-muted-foreground text-base font-medium">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between">
            <p class="text-4xl font-bold text-foreground">
              {{ formatCurrency(authStore.user?.balance || 0) }}
            </p>
            <Button @click="showTopupModal = true" class="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              Top Up Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Stats Grid -->
      <div v-if="stats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">{{ stats.total_requests }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">TTS Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">{{ stats.tts_requests }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">STT Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">{{ stats.stt_requests }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">Total Cost (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">
              {{ formatCurrency(stats.total_cost) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activity -->
      <Card>
        <CardHeader>
          <CardTitle class="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="recentLogs && recentLogs.length > 0" class="space-y-3">
            <div
              v-for="log in recentLogs"
              :key="log.id"
              class="flex items-center justify-between py-3 border-b border-border last:border-b-0"
            >
              <div class="flex items-center space-x-3">
                <Badge
                  :variant="log.service_type === 'tts' ? 'default' : 'secondary'"
                  class="font-medium"
                >
                  {{ log.service_type.toUpperCase() }}
                </Badge>
                <span class="text-sm text-muted-foreground">
                  {{ log.service_type === 'tts' ? `${log.character_count} chars` : `${Math.ceil((log.duration_seconds || 0) / 60)}min` }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm font-medium text-foreground">
                  {{ formatCurrency(log.cost) }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ formatDate(log.created_at) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-muted-foreground">
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

