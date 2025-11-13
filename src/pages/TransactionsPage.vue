<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>

      <div v-if="transactions && transactions.length > 0" class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="transaction in transactions" :key="transaction.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center space-x-3">
                  <span
                    :class="getTypeColor(transaction.type)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ transaction.type.toUpperCase() }}
                  </span>
                  <span
                    :class="getStatusColor(transaction.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ transaction.status }}
                  </span>
                </div>
                <p class="mt-2 text-sm text-gray-600">{{ transaction.description }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ formatDate(transaction.created_at) }}
                </p>
              </div>
              <div class="text-right">
                <p
                  :class="transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'"
                  class="text-lg font-semibold"
                >
                  {{ transaction.amount >= 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
                </p>
                <p v-if="transaction.payment_method" class="text-sm text-gray-500">
                  via {{ transaction.payment_method }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No transactions yet
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
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

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    topup: 'bg-green-100 text-green-800',
    usage: 'bg-blue-100 text-blue-800',
    refund: 'bg-yellow-100 text-yellow-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
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

