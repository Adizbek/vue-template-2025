import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/lib/api'

export interface User {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  is_verified: boolean
  balance: number
  oauth_provider: string | null
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    try {
      const { data } = await apiClient.post('/auth/login', credentials)
      setTokens(data.access_token, data.refresh_token)
      await fetchUser()
      return true
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData: RegisterData) {
    isLoading.value = true
    try {
      const { data } = await apiClient.post('/auth/register', userData)
      setTokens(data.access_token, data.refresh_token)
      await fetchUser()
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return

    isLoading.value = true
    try {
      const { data } = await apiClient.get('/auth/me')
      user.value = data
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      isLoading.value = false
    }
  }

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // OAuth callback handler
  function handleOAuthCallback(access: string, refresh: string) {
    setTokens(access, refresh)
    fetchUser()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    fetchUser,
    handleOAuthCallback,
  }
})

