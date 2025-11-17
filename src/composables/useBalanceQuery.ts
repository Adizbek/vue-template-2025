import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import apiClient from '@/lib/api'
import { useAuthStore, type User as AuthUser } from '@/stores/auth'

export function useBalanceQuery() {
  const authStore = useAuthStore()

  const balanceQuery = useQuery<number>({
    queryKey: ['balance'],
    queryFn: async () => {
      const { data } = await apiClient.get<AuthUser>('/auth/me')
      authStore.user = data
      return data.balance
    },
    initialData: authStore.user?.balance,
  })

  const currentBalance = computed(
    () => balanceQuery.data.value ?? authStore.user?.balance ?? 0
  )

  return {
    balanceQuery,
    currentBalance,
    refetchBalance: balanceQuery.refetch,
  }
}
