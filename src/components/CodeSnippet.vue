<script setup lang="ts">
import { ref } from 'vue'
import { Copy } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  code: string
  label?: string
}>()

const copying = ref(false)
const { copy, isSupported } = useClipboard()

async function copyCode() {
  if (copying.value) return
  if (!isSupported.value) {
    toast.error('Clipboard not supported in this browser')
    return
  }

  copying.value = true
  try {
    await copy(props.code)
    toast.success('Snippet copied to clipboard')
  } catch (error) {
    console.error('Failed to copy snippet', error)
    toast.error('Unable to copy snippet')
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <div class="rounded-lg border border-border/60 bg-muted/40 overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/60">
      <span class="text-xs font-medium text-muted-foreground">
        {{ label || 'Example' }}
      </span>
      <Button variant="ghost" size="sm" class="h-8 px-2 gap-2" @click="copyCode" :disabled="copying">
        <Copy class="h-4 w-4" />
        <span class="text-xs">{{ copying ? 'Copying...' : 'Copy' }}</span>
      </Button>
    </div>
    <pre class="p-4 text-xs sm:text-sm overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>
