<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0 space-y-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-foreground">Text-to-Speech Playground</h1>
        <p class="text-sm text-muted-foreground">
          Convert text into lifelike speech using your API key. Costs are deducted from your
          balance.
        </p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <div class="bg-card shadow rounded-lg border border-border/50">
          <div class="px-4 py-5 sm:p-6 space-y-4">
            <div>
              <h2 class="text-lg font-medium text-foreground mb-1">Generate Speech</h2>
              <p class="text-sm text-muted-foreground">
                Pick a voice, type your text, and we will synthesize audio using your NeuronAI
                balance.
              </p>
            </div>

            <form class="space-y-4" @submit.prevent="handleTTS">
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
                <label class="block text-sm font-medium text-muted-foreground mb-2"> Voice </label>
                <Select v-model="ttsForm.voice_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="voice in voices" :key="voice.id" :value="voice.id">
                      {{ voice.name }} ({{ voice.gender }} / {{ voice.language }})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-2"> Text </label>
                <textarea
                  v-model="ttsForm.text"
                  class="block w-full border border-input bg-background rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
                  placeholder="Enter text to synthesize..."
                  rows="6"
                ></textarea>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ ttsForm.text.length }} characters
                </p>
              </div>

              <Button :disabled="ttsLoading || !ttsForm.text" class="w-full" type="submit">
                {{ ttsLoading ? 'Generating...' : 'Generate Speech' }}
              </Button>
            </form>

            <div v-if="ttsAudioUrl" class="mt-4 space-y-2">
              <p class="text-sm font-medium text-foreground">Preview</p>
              <audio :src="ttsAudioUrl" class="w-full" controls></audio>
              <p class="text-xs text-muted-foreground">
                Re-run the request to update the preview and balance information.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-card border border-border/50 rounded-lg p-5 shadow space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h2 class="text-lg font-semibold text-foreground">How to call the TTS API</h2>
                <p class="text-sm text-muted-foreground">
                  Use your selected API key in the
                  <code class="px-1 py-0.5 rounded bg-muted text-xs">X-Api-Key</code> header.
                </p>
              </div>
              <Badge class="uppercase" variant="secondary">TTS</Badge>
            </div>
            <ol class="list-decimal list-inside text-sm text-foreground space-y-1">
              <li>Create or copy an API key from the API Keys page and select it above.</li>
              <li>
                Send a <code class="px-1 py-0.5 rounded bg-muted text-xs">POST</code> request to
                <code class="px-1 py-0.5 rounded bg-muted text-xs">/api/v1/tts/synthesize</code>.
              </li>
              <li>
                Include <code class="px-1 py-0.5 rounded bg-muted text-xs">voice_id</code> and
                <code class="px-1 py-0.5 rounded bg-muted text-xs">text</code> in the JSON body.
              </li>
              <li>We return an MP3 stream. Save it locally or play it directly.</li>
            </ol>
            <CodeSnippet :code="ttsCurlSnippet" label="cURL example" />
            <div class="text-xs text-muted-foreground space-y-1">
              <p>Pricing: {{ pricingCopy }}</p>
              <p>
                The response includes
                <code class="px-1 py-0.5 rounded bg-muted text-[11px]">X-Cost</code> and balance
                headers so you can reconcile usage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
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
import type { APIKey, TTSVoice } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useBalanceQuery } from '@/composables/useBalanceQuery'

const voices = ref<TTSVoice[]>([])
const apiKeys = ref<APIKey[]>([])
const selectedApiKeyId = ref('')
const ttsForm = ref({
  voice_id: 'muhriddin_uz',
  text: '',
})
const ttsLoading = ref(false)
const ttsAudioUrl = ref<string | null>(null)

const selectedApiKey = computed(() =>
  apiKeys.value.find((key) => key.id === selectedApiKeyId.value)
)

const ttsCurlSnippet = computed(() => {
  const apiKeyHeader = selectedApiKey.value?.key || '<select a key above>'
  return `API_URL="https://api.neuronai.uz"
curl -X POST "$API_URL/api/v1/tts/synthesize" \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKeyHeader}" \\
  -d '{
    "voice_id": "muhriddin_uz",
    "text": "Hello from NeuronAI TTS"
  }' \\
  --output speech.mp3`
})

const pricingCopy = 'Pricing is calculated per character based on your plan.'

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

async function fetchVoices() {
  try {
    const { data } = await apiClient.get<TTSVoice[]>('/tts/voices')
    voices.value = data
    if (data.length > 0) {
      ttsForm.value.voice_id = data[0].id
    }
  } catch (error) {
    console.error('Failed to fetch voices:', error)
    toast.error('Failed to load voices')
  }
}

async function handleTTS() {
  const startingBalance = currentBalance.value
  ttsLoading.value = true
  ttsAudioUrl.value = null

  try {
    if (!selectedApiKey.value) {
      toast.error('Please select an API key first')
      return
    }

    const response = await apiClient.post('/tts/synthesize', ttsForm.value, {
      headers: {
        'X-Api-Key': selectedApiKey.value.key,
      },
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'audio/mpeg' })
    ttsAudioUrl.value = URL.createObjectURL(blob)

    const headerCost = response.headers['x-cost']
    const parsedHeaderCost = headerCost ? Number(headerCost) : NaN
    const costFromHeader = Number.isFinite(parsedHeaderCost) ? parsedHeaderCost : null

    let refreshedBalance: number | undefined
    try {
      const { data: balanceData } = await refetchBalance()
      refreshedBalance = balanceData
    } catch (balanceError) {
      console.error('Failed to refresh balance', balanceError)
    }

    const updatedBalance = refreshedBalance ?? startingBalance
    const calculatedCost = costFromHeader ?? Math.max(0, startingBalance - updatedBalance)

    toast.success(`Speech generated successfully. Cost: ${formatCurrency(calculatedCost || 0)}`)
  } catch (error: any) {
    console.error('TTS failed:', error)
    toast.error(error.response?.data?.detail || 'Failed to generate speech')
  } finally {
    ttsLoading.value = false
  }
}

onMounted(() => {
  fetchApiKeys()
  fetchVoices()
})
</script>
