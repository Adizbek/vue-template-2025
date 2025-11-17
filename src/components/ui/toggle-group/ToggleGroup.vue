<script setup lang="ts">
import { Primitive } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  modelValue?: string
  options: { label: string; value: string }[]
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): true
}>()

function onSelect(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="inline-flex rounded-lg border border-border/60 bg-muted/40 p-1 text-sm font-medium" :class="props.class">
    <Primitive
      v-for="option in options"
      :key="option.value"
      as="button"
      type="button"
      :class="cn('px-3 py-1.5 rounded-md transition-all', option.value === modelValue ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')"
      @click="onSelect(option.value)"
    >
      {{ option.label }}
    </Primitive>
  </div>
</template>
