<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="fixed inset-0 bg-black bg-opacity-25" @click="$emit('update:open', false)"></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Top Up Balance</h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Amount (UZS)
            </label>
            <input
              v-model.number="form.amount"
              type="number"
              min="10000"
              step="1000"
              required
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="10000"
            />
            <p class="mt-1 text-xs text-gray-500">Minimum: 10,000 UZS</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              v-model="form.payment_method"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="payme">Payme</option>
              <option value="click">Click</option>
            </select>
          </div>

          <div class="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              @click="$emit('update:open', false)"
              class="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isLoading" class="flex-1">
              {{ isLoading ? 'Processing...' : 'Top Up' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const form = ref({
  amount: 10000,
  payment_method: 'payme',
})

const isLoading = ref(false)

async function handleSubmit() {
  isLoading.value = true

  try {
    await apiClient.post('/transactions/topup', form.value)
    toast.success('Top-up initiated. Please complete payment.')
    emit('success')
    emit('update:open', false)
  } catch (error: any) {
    console.error('Top-up failed:', error)
    toast.error(error.response?.data?.detail || 'Failed to initiate top-up')
  } finally {
    isLoading.value = false
  }
}
</script>
