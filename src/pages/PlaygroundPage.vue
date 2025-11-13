<template>
  <Layout>
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Playground</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- TTS Playground -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Text-to-Speech</h2>

            <form @submit.prevent="handleTTS" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  v-model="ttsForm.voice_id"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option v-for="voice in voices" :key="voice.id" :value="voice.id">
                    {{ voice.name }} ({{ voice.gender }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Text
                </label>
                <textarea
                  v-model="ttsForm.text"
                  rows="6"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter text to synthesize..."
                ></textarea>
                <p class="mt-1 text-sm text-gray-500">
                  {{ ttsForm.text.length }} characters
                </p>
              </div>

              <Button type="submit" :disabled="ttsLoading || !ttsForm.text" class="w-full">
                {{ ttsLoading ? 'Generating...' : 'Generate Speech' }}
              </Button>
            </form>

            <div v-if="ttsAudioUrl" class="mt-4">
              <audio :src="ttsAudioUrl" controls class="w-full"></audio>
            </div>
          </div>
        </div>

        <!-- STT Playground -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Speech-to-Text</h2>

            <form @submit.prevent="handleSTT" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  v-model="sttForm.lang"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="uz">Uzbek</option>
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Audio File
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  @change="handleFileChange"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <Button type="submit" :disabled="sttLoading || !sttFile" class="w-full">
                {{ sttLoading ? 'Transcribing...' : 'Transcribe Audio' }}
              </Button>
            </form>

            <div v-if="sttResult" class="mt-4 space-y-2">
              <div class="bg-gray-50 p-4 rounded-md">
                <p class="text-sm font-medium text-gray-700 mb-2">Transcription:</p>
                <p class="text-sm text-gray-900">{{ sttResult.text }}</p>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <p>Duration: {{ sttResult.duration_sec.toFixed(2) }}s</p>
                <p>Processing: {{ sttResult.processing_ms }}ms</p>
                <p>Model: {{ sttResult.model }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p class="text-sm text-yellow-800">
          <strong>Note:</strong> Playground uses your actual API balance. Each request will be charged according to your pricing plan.
        </p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/lib/api'
import Layout from '@/components/Layout.vue'
import { Button } from '@/components/ui/button'
import type { TTSVoice, STTResponse } from '@/types'
import { toast } from 'vue-sonner'

const voices = ref<TTSVoice[]>([])
const ttsForm = ref({
  voice_id: 'muhriddin_uz',
  text: '',
})
const ttsLoading = ref(false)
const ttsAudioUrl = ref<string | null>(null)

const sttForm = ref({
  lang: 'uz',
})
const sttFile = ref<File | null>(null)
const sttLoading = ref(false)
const sttResult = ref<STTResponse | null>(null)

async function fetchVoices() {
  try {
    const { data } = await apiClient.get('/tts/voices')
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
  ttsLoading.value = true
  ttsAudioUrl.value = null

  try {
    // Get user's first API key
    const { data: keys } = await apiClient.get('/api-keys')
    if (!keys || keys.length === 0) {
      toast.error('Please create an API key first')
      return
    }

    const response = await apiClient.post(
      '/tts/synthesize',
      ttsForm.value,
      {
        headers: {
          'X-Api-Key': keys[0].key,
        },
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], { type: 'audio/mpeg' })
    ttsAudioUrl.value = URL.createObjectURL(blob)
    toast.success('Speech generated successfully')
  } catch (error: any) {
    console.error('TTS failed:', error)
    toast.error(error.response?.data?.detail || 'Failed to generate speech')
  } finally {
    ttsLoading.value = false
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

  sttLoading.value = true
  sttResult.value = null

  try {
    // Get user's first API key
    const { data: keys } = await apiClient.get('/api-keys')
    if (!keys || keys.length === 0) {
      toast.error('Please create an API key first')
      return
    }

    const formData = new FormData()
    formData.append('file', sttFile.value)
    formData.append('lang', sttForm.value.lang)

    const { data } = await apiClient.post('/stt/transcribe', formData, {
      headers: {
        'X-Api-Key': keys[0].key,
        'Content-Type': 'multipart/form-data',
      },
    })

    sttResult.value = data
    toast.success('Audio transcribed successfully')
  } catch (error: any) {
    console.error('STT failed:', error)
    toast.error(error.response?.data?.detail || 'Failed to transcribe audio')
  } finally {
    sttLoading.value = false
  }
}

onMounted(() => {
  fetchVoices()
})
</script>

