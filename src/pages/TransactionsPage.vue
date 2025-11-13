<template>
  <Layout>
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>

      <div v-if="transactions && transactions.length > 0" class="grid gap-4">
        <Card
          v-for="transaction in transactions"
          :key="transaction.id"
          class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800"
        >
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <Badge :variant="getTypeVariant(transaction.transaction_type)">
                    {{ transaction.transaction_type.toUpperCase() }}
                  </Badge>
                  <Badge :variant="getStatusVariant(transaction.status)">
                    {{ transaction.status }}
                  </Badge>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getTransactionDescription(transaction) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ formatDate(transaction.created_at) }}
                </p>
              </div>
              <div class="text-right">
                <p
                  :class="transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                  class="text-lg font-semibold"
                >
                  {{ transaction.amount >= 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
                </p>
                <p v-if="transaction.payment_method" class="text-sm text-gray-500 dark:text-gray-400">
                  via {{ transaction.payment_method }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card v-else class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
        <CardContent class="text-center py-12 text-gray-500 dark:text-gray-400">
          No transactions yet
        </CardContent>
      </Card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Transaction } from '@/types'

const transactions = ref<Transaction[]>([])

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(Math.abs(amount)) + ' UZS'
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
  return typeDescriptions[transaction.transaction_type] || 'Transaction'
}

async function fetchTransactions() {
  try {
    const { data } = await apiClient.get('/transactions')
    transactions.value = data.transactions
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  }
}

onMounted(() => {
  fetchTransactions()
})
</script>

