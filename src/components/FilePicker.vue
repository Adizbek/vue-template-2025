<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{
  file?: File | null
  accept?: string
  buttonText?: string
  changeButtonText?: string
  emptyText?: string
  showSize?: boolean
}>(), {
  file: null,
  accept: '*/*',
  buttonText: 'Select file',
  changeButtonText: 'Change file',
  emptyText: 'No file selected',
  showSize: true,
})

const emit = defineEmits<{
  (e: 'update:file', file: File | null): void
  (e: 'change', file: File | null): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const actionLabel = computed(() =>
  props.file ? props.changeButtonText : props.buttonText
)

const fileSize = computed(() => {
  if (!props.file || !props.showSize) return ''
  return `${Math.round(props.file.size / 1024)} KB`
})

function triggerSelect() {
  inputRef.value?.click()
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  emit('update:file', file)
  emit('change', file)
  // reset value to allow re-selecting the same file
  target.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleChange"
    />
    <Button type="button" size="lg" class="sm:w-auto w-full" @click="triggerSelect">
      {{ actionLabel }}
    </Button>
    <div class="flex-1 rounded-md border border-dashed border-border/70 bg-secondary/50 px-3 py-2 text-sm">
      <p class="text-foreground" v-if="file">
        {{ file.name }}
      </p>
      <p class="text-muted-foreground" v-if="file && fileSize">
        {{ fileSize }}
      </p>
      <p v-else class="text-muted-foreground">{{ emptyText }}</p>
    </div>
  </div>
</template>
