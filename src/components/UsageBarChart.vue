<script setup lang="ts">
import { computed } from 'vue'
import {
  VisAxis,
  VisGroupedBar,
  VisXYContainer,
} from '@unovis/vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  componentToString,
  type ChartConfig,
} from '@/components/ui/chart'
import UsageTooltipContent from '@/components/UsageTooltipContent.vue'

const props = defineProps<{
  labels: string[]
  tts: number[]
  stt: number[]
  costs?: number[]
}>()

const chartConfig: ChartConfig = {
  tts: {
    label: 'TTS',
    color: 'hsl(210 90% 60%)',
  },
  stt: {
    label: 'STT',
    color: 'hsl(26 98% 60%)',
  },
  cost: {
    label: 'Cost',
    color: 'var(--muted-foreground)',
  },
  total: {
    label: 'Total',
    color: 'var(--muted-foreground)',
  },
} satisfies Record<string, { label: string; color: string }>

type Data = {
  index: number
  label: string
  tts: number
  stt: number
  cost: number
}

const chartData = computed<Data[]>(() =>
  props.labels.map((label, idx) => ({
    index: idx,
    label,
    tts: props.tts[idx] ?? 0,
    stt: props.stt[idx] ?? 0,
    cost: props.costs?.[idx] ?? 0,
  }))
)

const maxValue = computed(() =>
  Math.max(0, ...chartData.value.map((d) => d.tts + d.stt))
)

const tooltip = componentToString(chartConfig, UsageTooltipContent, {
  indicator: 'dashed',
  hideLabel: true,
})

const colors = [chartConfig.tts.color ?? 'hsl(210 90% 60%)', chartConfig.stt.color ?? 'hsl(26 98% 60%)']
</script>

<template>
  <ChartContainer :config="chartConfig" class="h-64">
    <VisXYContainer :data="chartData" :y-domain="[0, maxValue || 1]" :duration="0">
      <VisGroupedBar
        :x="(d: Data) => d.index"
        :y="[(d: Data) => d.tts, (d: Data) => d.stt]"
        :color="colors"
        :rounded-corners="4"
        bar-padding="0.2"
        group-padding="0.05"
        :animation-duration="0"
        :bar-label="(d: [number, number], i: number) => {
          const value = d[i] ?? 0
          return `${value || 0}`
        }"
      />
      <VisAxis
        type="x"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
        :tick-text-color="'var(--muted-foreground)'"
        :tick-values="chartData.map((d) => d.index)"
        :tick-format="(d: number) => chartData[d]?.label ?? ''"
      />
      <VisAxis
        type="y"
        :num-ticks="4"
        :tick-line="false"
        :domain-line="false"
        :tick-text-color="'var(--muted-foreground)'"
      />
      <ChartTooltip
        :template="componentToString(chartConfig, UsageTooltipContent, {
          indicator: 'dot',
          hideLabel: false,
        })"
      />
      <ChartCrosshair :template="tooltip" color="#0000" />
    </VisXYContainer>
  </ChartContainer>
</template>
