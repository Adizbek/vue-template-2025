<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
    <div class="absolute inset-0" @click="$emit('update:open', false)"></div>

    <div class="relative w-full max-w-md rounded-xl border border-border bg-card text-foreground shadow-2xl shadow-black/15 dark:shadow-black/40">
      <div class="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Balance</p>
          <h3 class="text-lg font-semibold">Top Up</h3>
        </div>
        <Button type="button" variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground" @click="$emit('update:open', false)">
          <span class="sr-only">Close</span>
          <span aria-hidden="true">X</span>
        </Button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 px-6 py-5">
        <div class="space-y-2">
          <Label for="amount">Amount (UZS)</Label>
          <Input
            id="amount"
            v-model.number="form.amount"
            type="number"
            min="10000"
            step="1000"
            required
            placeholder="10000"
          />
          <p class="text-xs text-muted-foreground">Minimum: 10,000 UZS</p>
        </div>

        <div class="space-y-2">
          <Label>Payment Method</Label>
          <Select v-model="form.payment_method">
            <SelectTrigger>
              <SelectValue placeholder="Choose a method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payme">Payme</SelectItem>
              <SelectItem value="click">Click</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex gap-3 pt-2">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
