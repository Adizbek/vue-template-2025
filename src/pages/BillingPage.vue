<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-foreground">Billing</h1>
        <p class="text-sm text-muted-foreground">
          Track balance, view transactions, and monitor usage in one place.
        </p>
      </div>

      <div class="inline-flex overflow-hidden rounded-lg border border-border/60 bg-muted/40 p-1 text-sm font-medium">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="rounded-md px-4 py-2 transition-all"
          :class="tab.key === activeTab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="setTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'balance'">
        <Card class="shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-foreground">Current balance</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="text-4xl font-black tracking-tight text-foreground">
              {{ formatCurrency(currentBalance) }}
            </div>
            <p class="text-sm text-muted-foreground">
              Keep your balance topped up to avoid interruptions to Speech or Text services.
            </p>
            <div class="flex flex-wrap gap-2">
              <Button class="gap-2" size="lg" @click="openTopup">Top up balance</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-else-if="activeTab === 'transactions'">
        <h2 class="text-lg font-semibold text-foreground">All transactions</h2>
        <div v-if="transactions.length" class="grid gap-4 mt-3">
          <Card v-for="transaction in transactions" :key="transaction.id" class="shadow-sm">
            <CardContent>
              <div class="flex items-center justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-3">
                    <Badge :variant="getTypeVariant(transaction.type)">
                      {{ transaction.type.toUpperCase() }}
                    </Badge>
                    <Badge :variant="getStatusVariant(transaction.status)">
                      {{ transaction.status.toUpperCase() }}
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    {{ getTransactionDescription(transaction) }}
                  </p>
                  <p class="text-xs text-muted-foreground/80">
                    {{ formatDate(transaction.created_at) }}
                  </p>
                </div>
                <div class="text-right">
                  <p
                    :class="transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'"
                    class="text-lg font-semibold"
                  >
                    {{ transaction.amount >= 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
                  </p>
                  <p v-if="transaction.payment_method" class="text-sm text-muted-foreground">
                    via {{ transaction.payment_method }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card v-else class="mt-3">
          <CardContent class="text-center py-12 text-muted-foreground">
            No transactions yet
          </CardContent>
        </Card>
      </div>

      <div v-else class="space-y-5">
        <div>
          <h2 class="text-lg font-semibold text-foreground">Usage</h2>
          <p class="text-sm text-muted-foreground">Hourly, daily, weekly, and monthly usage for STT and TTS.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <ToggleGroup
            v-model="usageInterval"
            :options="[
              { label: 'Hourly', value: 'hour' },
              { label: 'Daily', value: 'day' },
              { label: 'Weekly', value: 'week' },
              { label: 'Monthly', value: 'month' },
            ]"
          />
        </div>

        <div v-if="usageStats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-3xl font-bold text-foreground">{{ usageStats.total_requests }}</p>
              <p class="text-sm text-muted-foreground mt-1">{{ formatCurrency(usageStats.total_cost) }}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground">TTS Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-3xl font-bold text-foreground">{{ usageStats.tts_requests }}</p>
              <p class="text-sm text-muted-foreground mt-1">
                {{ usageStats.tts_characters.toLocaleString() }} chars · {{ formatCurrency(usageStats.tts_cost) }}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground">STT Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-3xl font-bold text-foreground">{{ usageStats.stt_requests }}</p>
              <p class="text-sm text-muted-foreground mt-1">
                {{ usageStats.stt_minutes.toFixed(1) }} min · {{ formatCurrency(usageStats.stt_cost) }}
              </p>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-4">
          <div class="rounded-lg border border-border/60 bg-card/70 p-4 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  {{ usageIntervalLabel }}
                </p>
                <p class="text-sm text-muted-foreground">TTS vs STT requests</p>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ usageChart.max > 0 ? `${usageChart.max} req max` : 'No data yet' }}
              </p>
            </div>
            <UsageBarChart
              :labels="usageChart.buckets.map((b) => b.label)"
              :tts="usageChart.buckets.map((b) => b.tts)"
              :stt="usageChart.buckets.map((b) => b.stt)"
              :costs="usageChart.buckets.map((b) => b.cost)"
            />
          </div>
        </div>
      </div>
    </div>

    <TopupModal :open="isTopupOpen" @update:open="isTopupOpen = $event" @success="handleTopupSuccess" />
  </Layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import TopupModal from '@/components/TopupModal.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup } from '@/components/ui/toggle-group'
import type { Transaction, UsageLog, UsageStats } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useBalanceQuery } from '@/composables/useBalanceQuery'
import UsageBarChart from '@/components/UsageBarChart.vue'

type TabKey = 'balance' | 'transactions' | 'usage'
type IntervalKey = 'hour' | 'day' | 'week' | 'month'

interface UsageBucket {
  label: string
  tts: number
  stt: number
  total: number
  cost: number
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'balance', label: 'Balance' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'usage', label: 'Usage' },
]

const route = useRoute()
const router = useRouter()
const activeTab = ref<TabKey>('balance')
const transactions = ref<Transaction[]>([])
const usageStats = ref<UsageStats | null>(null)
const usageLogs = ref<UsageLog[]>([])
const isTopupOpen = ref(false)
const usageInterval = ref<IntervalKey>('hour')

const { currentBalance, refetchBalance } = useBalanceQuery()

const usageChart = computed(() => buildChart(usageInterval.value, intervalBuckets[usageInterval.value]))
const intervalBuckets: Record<IntervalKey, number> = {
  hour: 12,
  day: 12,
  week: 12,
  month: 12,
}
const usageIntervalLabel = computed(() => {
  const map: Record<IntervalKey, string> = {
    hour: 'Hourly (last 12)',
    day: 'Daily (last 12)',
    week: 'Weekly (last 12)',
    month: 'Monthly (last 12)',
  }
  return map[usageInterval.value]
})

function syncTabFromRoute(tabParam?: string) {
  if (tabParam && ['balance', 'transactions', 'usage'].includes(tabParam)) {
    activeTab.value = tabParam as TabKey
  } else {
    activeTab.value = 'balance'
  }
}

function setTab(tab: TabKey) {
  activeTab.value = tab
  router.replace({ name: 'billing', query: { tab } })
}

function openTopup() {
  activeTab.value = 'balance'
  router.replace({ name: 'billing', query: { tab: 'balance' } })
  isTopupOpen.value = true
}

function buildChart(interval: IntervalKey, bucketCount: number) {
  const now = new Date()
  const anchor = floorDate(now, interval)
  const buckets: UsageBucket[] = []

  for (let i = bucketCount - 1; i >= 0; i--) {
    const start = shiftDate(anchor, -i, interval)
    const end = shiftDate(start, 1, interval)
    const label = formatBucketLabel(start, interval)

    const bucketLogs = usageLogs.value.filter((log) => {
      const timestamp = new Date(log.created_at)
      return timestamp >= start && timestamp < end
    })

    const tts = bucketLogs.filter((log) => log.service_type === 'tts').length
    const stt = bucketLogs.filter((log) => log.service_type === 'stt').length
    const cost = bucketLogs.reduce((sum, log) => sum + (log.cost ?? 0), 0)
    buckets.push({ label, tts, stt, total: tts + stt, cost })
  }

  const max = Math.max(0, ...buckets.map((b) => b.total))
  return { buckets, max }
}

function floorDate(date: Date, interval: IntervalKey) {
  const d = new Date(date)
  if (interval === 'hour') {
    d.setMinutes(0, 0, 0)
  } else if (interval === 'day') {
    d.setHours(0, 0, 0, 0)
  } else if (interval === 'week') {
    const day = d.getDay()
    const diff = (day + 6) % 7 // Monday as start
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - diff)
  } else if (interval === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  }
  return d
}

function shiftDate(date: Date, delta: number, interval: IntervalKey) {
  const d = new Date(date)
  if (interval === 'hour') {
    d.setHours(d.getHours() + delta)
  } else if (interval === 'day') {
    d.setDate(d.getDate() + delta)
  } else if (interval === 'week') {
    d.setDate(d.getDate() + delta * 7)
  } else if (interval === 'month') {
    d.setMonth(d.getMonth() + delta)
  }
  return d
}

function formatBucketLabel(date: Date, interval: IntervalKey) {
  if (interval === 'hour') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false })
  }
  if (interval === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (interval === 'week') {
    const month = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Week of ${month}`
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
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

function getTypeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    topup: 'default',
    deduction: 'secondary',
    refund: 'outline',
  }
  return variants[type] || 'secondary'
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    completed: 'default',
    pending: 'outline',
    failed: 'destructive',
    cancelled: 'secondary',
  }
  return variants[status] || 'secondary'
}

function getTransactionDescription(transaction: Transaction): string {
  const typeDescriptions: Record<string, string> = {
    topup: 'Balance top-up',
    deduction: 'Service usage charge',
    refund: 'Refund',
  }
  return typeDescriptions[transaction.type] || 'Transaction'
}

async function fetchTransactions() {
  try {
    const { data } = await apiClient.get('/transactions')
    transactions.value = data.transactions || data || []
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  }
}

async function fetchUsage() {
  try {
    const [{ data: statsData }, { data: logsData }] = await Promise.all([
      apiClient.get('/usage/stats'),
      apiClient.get('/usage', { params: { limit: 200 } }),
    ])
    usageStats.value = statsData
    usageLogs.value = logsData.logs || []
  } catch (error) {
    console.error('Failed to fetch usage info:', error)
  }
}

function handleTopupSuccess() {
  refetchBalance()
  fetchTransactions()
}

watch(
  () => route.query.tab,
  (tab) => syncTabFromRoute(tab as string | undefined),
  { immediate: true },
)

onMounted(() => {
  fetchTransactions()
  fetchUsage()
})
</script>
