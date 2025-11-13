<template>
  <Layout>
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-foreground">Usage Statistics</h1>

      <!-- Stats Overview -->
      <div v-if="stats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">{{ stats.total_requests }}</p>
            <p class="text-sm text-muted-foreground mt-1">{{ formatCurrency(stats.total_cost) }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">TTS Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">{{ stats.tts_requests }}</p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ stats.tts_characters.toLocaleString() }} chars · {{ formatCurrency(stats.tts_cost) }}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-muted-foreground">STT Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold text-foreground">{{ stats.stt_requests }}</p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ stats.stt_minutes.toFixed(1) }} min · {{ formatCurrency(stats.stt_cost) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Usage Logs -->
      <Card>
        <CardHeader>
          <CardTitle class="text-foreground">Usage Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="logs && logs.length > 0" class="space-y-3">
            <div
              v-for="log in logs"
              :key="log.id"
              class="flex items-center justify-between py-3 border-b border-border last:border-b-0"
            >
              <div class="flex items-center space-x-4">
                <Badge :variant="log.service_type === 'tts' ? 'default' : 'secondary'">
                  {{ log.service_type.toUpperCase() }}
                </Badge>
                <Badge :variant="getStatusVariant(log.status)">
                  {{ log.status }}
                </Badge>
                <div class="text-sm text-muted-foreground">
                  <span v-if="log.service_type === 'tts'">
                    {{ log.character_count }} chars
                    <span v-if="log.voice_id" class="text-muted-foreground/80">· {{ log.voice_id }}</span>
                  </span>
                  <span v-else>
                    {{ Math.ceil((log.duration_seconds || 0) / 60) }} min
                    <span v-if="log.language" class="text-muted-foreground/80">· {{ log.language }}</span>
                  </span>
                </div>
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
            No usage logs yet
          </div>
        </CardContent>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    success: 'default',
    failed: 'destructive',
    rate_limited: 'outline',
    insufficient_balance: 'secondary',
  }
  return variants[status] || 'secondary'
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
