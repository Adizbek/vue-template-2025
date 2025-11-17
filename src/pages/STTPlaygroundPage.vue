<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0 space-y-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-foreground">Speech-to-Text Playground</h1>
        <p class="text-sm text-muted-foreground">
          Upload audio and get instant transcripts. We charge per processed minute using your API balance.
        </p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <div class="bg-card shadow rounded-lg border border-border/50">
          <div class="px-4 py-5 sm:p-6 space-y-4">
            <div>
              <h2 class="text-lg font-medium text-foreground mb-1">Transcribe Audio</h2>
              <p class="text-sm text-muted-foreground">
                Choose a language, upload your audio file, and we will return the transcript plus timing details.
              </p>
            </div>

            <form @submit.prevent="handleSTT" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-2"> API Key </label>
                <Select v-model="selectedApiKeyId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select an API key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="key in apiKeys" :key="key.id" :value="key.id">
                      {{ key.name || 'API Key' }} • {{ key.key_preview }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-2">
                  Language
                </label>
                <Select v-model="sttForm.lang">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uz">Uzbek</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-2">
                  Audio File
                </label>
                <Input
                  type="file"
                  accept="audio/*"
                  @change="handleFileChange"
                  class="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <p v-if="sttFile" class="text-xs text-muted-foreground mt-1">
                  {{ sttFile.name }} ({{ Math.round(sttFile.size / 1024) }} KB)
                </p>
              </div>

              <Button type="submit" :disabled="sttLoading || !sttFile" class="w-full">
                {{ sttLoading ? 'Transcribing...' : 'Transcribe Audio' }}
              </Button>
            </form>

            <div v-if="sttResult" class="mt-4 space-y-3">
              <div class="bg-muted/50 p-4 rounded-md">
                <p class="text-sm font-medium text-muted-foreground mb-2">Transcription:</p>
                <p class="text-sm text-foreground whitespace-pre-line">{{ sttResult.text }}</p>
              </div>
              <div class="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <p><span class="font-medium text-foreground">Duration:</span> {{ sttResult.duration_sec.toFixed(2) }}s</p>
                <p><span class="font-medium text-foreground">Billed Seconds:</span> {{ sttResult.billed_seconds }}</p>
                <p><span class="font-medium text-foreground">Processing:</span> {{ sttResult.processing_ms }}ms</p>
                <p><span class="font-medium text-foreground">Model:</span> {{ sttResult.model }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-card border border-border/50 rounded-lg p-5 shadow space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h2 class="text-lg font-semibold text-foreground">How to call the STT API</h2>
                <p class="text-sm text-muted-foreground">
                  Authenticate with your API key and send multipart form data with your audio file.
                </p>
              </div>
              <Badge variant="secondary" class="uppercase">STT</Badge>
            </div>
            <ol class="list-decimal list-inside text-sm text-foreground space-y-1">
              <li>Create or copy an API key from the API Keys page and select it above.</li>
              <li>Send a <code class="px-1 py-0.5 rounded bg-muted text-xs">POST</code> request to <code class="px-1 py-0.5 rounded bg-muted text-xs">/api/v1/stt/transcribe</code>.</li>
              <li>Attach your audio file as <code class="px-1 py-0.5 rounded bg-muted text-xs">file</code> and optional <code class="px-1 py-0.5 rounded bg-muted text-xs">lang</code>.</li>
              <li>Receive the transcript with timing metadata and billable seconds.</li>
            </ol>
            <CodeSnippet :code="sttCurlSnippet" label="cURL example" />
            <div class="text-xs text-muted-foreground space-y-1">
              <p>Pricing is per rounded-up minute. We refresh your balance after each transcription.</p>
              <p>Responses include <code class="px-1 py-0.5 rounded bg-muted text-[11px]">duration_sec</code>, <code class="px-1 py-0.5 rounded bg-muted text-[11px]">billed_seconds</code>, and <code class="px-1 py-0.5 rounded bg-muted text-[11px]">request_id</code> for audit tracking.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import CodeSnippet from '@/components/CodeSnippet.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { APIKey, STTResponse } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useBalanceQuery } from '@/composables/useBalanceQuery'

const apiKeys = ref<APIKey[]>([])
const selectedApiKeyId = ref('')
const sttForm = ref({
  lang: 'uz',
})
const sttFile = ref<File | null>(null)
const sttLoading = ref(false)
const sttResult = ref<STTResponse | null>(null)

const selectedApiKey = computed(() =>
  apiKeys.value.find((key) => key.id === selectedApiKeyId.value)
)

const sttCurlSnippet = computed(() => {
  const apiKeyHeader = selectedApiKey.value?.key || '<select a key above>'
  return `API_URL="https://api.neuronai.uz"
curl -X POST "$API_URL/api/v1/stt/transcribe" \\
  -H "X-Api-Key: ${apiKeyHeader}" \\
  -F "file=@/path/to/audio.wav" \\
  -F "lang=uz"`
})

const { currentBalance, refetchBalance } = useBalanceQuery()

async function fetchApiKeys() {
  try {
    const { data } = await apiClient.get<APIKey[]>('/api-keys')
    apiKeys.value = data
    if (data.length > 0) {
      selectedApiKeyId.value = data[0].id
    }
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    toast.error('Failed to load API keys')
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    sttFile.value = target.files[0]
  }
}

async function handleSTT() {
  if (!sttFile.value) return

  const startingBalance = currentBalance.value
  sttLoading.value = true
  sttResult.value = null

  try {
    if (!selectedApiKey.value) {
      toast.error('Please select an API key first')
      return
    }

    const formData = new FormData()
    formData.append('file', sttFile.value)
    formData.append('lang', sttForm.value.lang)

    const { data } = await apiClient.post<STTResponse>('/stt/transcribe', formData, {
      headers: {
        'X-Api-Key': selectedApiKey.value.key,
        'Content-Type': 'multipart/form-data',
      },
    })

    sttResult.value = data

    let refreshedBalance: number | undefined
    try {
      const { data: balanceData } = await refetchBalance()
      refreshedBalance = balanceData
    } catch (balanceError) {
      console.error('Failed to refresh balance', balanceError)
    }

    const updatedBalance = refreshedBalance ?? startingBalance
    const calculatedCost = Math.max(0, startingBalance - updatedBalance)

    toast.success(
      `Audio transcribed successfully. Cost: ${formatCurrency(calculatedCost)}`
    )
  } catch (error: any) {
    console.error('STT failed:', error)
    toast.error(error.response?.data?.detail || 'Failed to transcribe audio')
  } finally {
    sttLoading.value = false
  }
}

onMounted(() => {
  fetchApiKeys()
})
</script>
