<template>
  <div v-if="open && apiKey" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
    <div class="absolute inset-0" @click="$emit('update:open', false)"></div>

    <div class="relative w-full max-w-md rounded-xl border border-border bg-card text-foreground shadow-2xl shadow-black/15 dark:shadow-black/40">
      <div class="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">API Keys</p>
          <h3 class="text-lg font-semibold">API Key Details</h3>
        </div>
        <Button type="button" variant="ghost" size="icon" class="text-muted-foreground hover:text-foreground" @click="$emit('update:open', false)">
          <span class="sr-only">Close</span>
          <span aria-hidden="true">X</span>
        </Button>
      </div>

      <div class="space-y-4 px-6 py-5 text-sm">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
          <p class="font-medium text-foreground">{{ apiKey.name }}</p>
        </div>

        <div v-if="apiKey.description" class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
          <p class="text-foreground">{{ apiKey.description }}</p>
        </div>

        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">API Key</p>
          <div class="flex items-center gap-2">
            <code class="flex-1 rounded border border-border bg-muted/40 px-3 py-2 text-xs break-all">
              {{ showFullKey ? apiKey.key : apiKey.key_preview }}
            </code>
            <Button size="sm" variant="outline" @click="toggleKey">
              {{ showFullKey ? 'Hide' : 'Show' }}
            </Button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <p class="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <Badge :variant="apiKey.is_active ? 'default' : 'secondary'">
            {{ apiKey.is_active ? 'Active' : 'Inactive' }}
          </Badge>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Max Concurrent</p>
            <p class="font-medium text-foreground">{{ apiKey.max_concurrent_requests }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
            <p class="text-foreground">{{ formatDate(apiKey.created_at) }}</p>
          </div>
          <div v-if="apiKey.last_used_at" class="space-y-1 col-span-2">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">Last Used</p>
            <p class="text-foreground">{{ formatDate(apiKey.last_used_at) }}</p>
          </div>
        </div>

        <Button @click="$emit('update:open', false)" class="w-full">
          Close
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { APIKey } from '@/types'

defineProps<{
  open: boolean
  apiKey?: APIKey | null
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()

const showFullKey = ref(false)

function toggleKey() {
  showFullKey.value = !showFullKey.value
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
</script>
