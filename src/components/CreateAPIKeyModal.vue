<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
    <div class="absolute inset-0" @click="$emit('update:open', false)"></div>

    <div class="relative w-full max-w-md rounded-xl border border-border bg-card text-foreground shadow-2xl shadow-black/15 dark:shadow-black/40">
      <div class="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">API Keys</p>
          <h3 class="text-lg font-semibold">
            {{ keyToEdit ? 'Edit API Key' : 'Create API Key' }}
          </h3>
        </div>
        <Button type="button" variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground" @click="$emit('update:open', false)">
          <span class="sr-only">Close</span>
          <span aria-hidden="true">X</span>
        </Button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 px-6 py-5">
        <div class="space-y-2">
          <Label for="api-key-name">Name</Label>
          <Input
            id="api-key-name"
            v-model="form.name"
            type="text"
            required
            placeholder="My API Key"
          />
        </div>

        <div class="space-y-2">
          <Label for="api-key-description">Description</Label>
          <textarea
            id="api-key-description"
            v-model="form.description"
            rows="3"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring/60"
            placeholder="Optional description"
          ></textarea>
        </div>

        <div class="space-y-2">
          <Label for="max-requests">Max Concurrent Requests</Label>
          <Input
            id="max-requests"
            v-model.number="form.max_concurrent_requests"
            type="number"
            min="1"
            max="100"
            required
          />
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
            {{ isLoading ? 'Saving...' : (keyToEdit ? 'Update' : 'Create') }}
          </Button>
        </div>
      </form>

      <div v-if="createdKey" class="mx-6 mb-6 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
        <p class="font-semibold text-primary mb-2">API Key Created</p>
        <code class="block rounded border border-border bg-background px-3 py-2 text-xs break-all">
          {{ createdKey }}
        </code>
        <p class="mt-2 text-xs text-muted-foreground">Save this key securely. You won't be able to see it again.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import apiClient from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import type { APIKey } from '@/types'

const props = defineProps<{
  open: boolean
  keyToEdit?: APIKey | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const form = ref({
  name: '',
  description: '',
  max_concurrent_requests: 5,
})

const isLoading = ref(false)
const createdKey = ref<string | null>(null)

watch(() => props.keyToEdit, (key) => {
  if (key) {
    form.value = {
      name: key.name,
      description: key.description || '',
      max_concurrent_requests: key.max_concurrent_requests,
    }
  } else {
    form.value = {
      name: '',
      description: '',
      max_concurrent_requests: 5,
    }
  }
  createdKey.value = null
})

async function handleSubmit() {
  isLoading.value = true

  try {
    if (props.keyToEdit) {
      await apiClient.put(`/api-keys/${props.keyToEdit.id}`, form.value)
      toast.success('API key updated successfully')
      emit('success')
      emit('update:open', false)
    } else {
      const { data } = await apiClient.post('/api-keys', form.value)
      createdKey.value = data.key
      toast.success('API key created successfully')
      emit('success')
    }
  } catch (error: any) {
    console.error('Failed to save API key:', error)
    toast.error(error.response?.data?.detail || 'Failed to save API key')
  } finally {
    isLoading.value = false
  }
}
</script>
