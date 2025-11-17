<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import { type ChartConfig, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrency } from '@/lib/utils'

const props = defineProps({
  payload: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<ChartConfig>,
    default: () => ({}),
  },
  indicator: {
    type: String as PropType<'dot' | 'line' | 'dashed'>,
    default: 'dot',
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
})

const yValues = computed(() => {
  const raw = props.payload?.y
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'number') return [raw]
  if (typeof props.payload === 'object') {
    const { tts = 0, stt = 0 } = props.payload as any
    return [tts ?? 0, stt ?? 0]
  }
  return [0, 0]
})

const mappedPayload = computed(() => {
  const [tts = 0, stt = 0] = yValues.value
  const cost = typeof props.payload?.cost === 'number' ? props.payload.cost : 0
  const label = props.payload?.label ?? props.payload?.x ?? ''
  return {
    label: `${label}${label ? ' · ' : ''}${formatCurrency(cost)}`,
    tts,
    stt,
    total: (tts ?? 0) + (stt ?? 0),
    cost: formatCurrency(cost),
  }
})
</script>

<template>
  <ChartTooltipContent
    :config="config"
    :hide-label="hideLabel"
    :indicator="indicator"
    :payload="mappedPayload"
    label-key="label"
  />
</template>
