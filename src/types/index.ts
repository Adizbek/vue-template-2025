export interface User {
  id: string
  email: string
  balance: number
  created_at: string
  updated_at: string
}

export interface APIKey {
  id: string
  user_id: string
  name: string
  description?: string
  key_preview: string
  is_active: boolean
  max_concurrent_requests: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  transaction_type: 'topup' | 'deduction' | 'refund'
  amount: number
  balance_before: number
  balance_after: number
  status: 'pending' | 'completed' | 'failed'
  payment_method?: string
  transaction_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  api_key_id: string
  service_name: string
  service_type: 'tts' | 'stt'
  endpoint: string
  tokens_used: number
  cost: number
  status: string
  character_count?: number
  voice_id?: string
  duration_seconds?: number
  language?: string
  request_metadata?: Record<string, any>
  created_at: string
}

export interface UsageStats {
  total_requests: number
  total_cost: number
  tts_requests: number
  tts_characters: number
  tts_cost: number
  stt_requests: number
  stt_minutes: number
  stt_cost: number
}

