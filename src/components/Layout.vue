<template>
  <div
    class="min-h-screen bg-background"
  >
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 transition-transform">
      <div
        class="h-full overflow-y-auto bg-card/80 backdrop-blur-xl border-r border-border shadow-lg"
      >
        <!-- Logo -->
        <div class="flex h-16 items-center border-b border-border px-6">
          <h1
            class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            NeuronAI
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="space-y-1 px-3 py-4">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            v-slot="{ isActive }"
            :to="item.path"
          >
            <div
              :class="[
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted',
              ]"
            >
              <component :is="item.icon" :class="['h-5 w-5', isActive ? 'text-white' : '']" />
              <span>{{ item.label }}</span>
            </div>
          </router-link>
        </nav>

        <!-- Balance Card -->
        <div class="mx-3 my-4">
          <Card
            class="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20"
          >
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-foreground">
                {{ formatCurrency(authStore.user?.balance || 0) }}
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Bottom Section -->
        <div
          class="absolute bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-xl"
        >
          <div class="p-4 space-y-3">
            <!-- Theme Toggle -->
            <div class="flex items-center justify-between px-3 py-2">
              <div class="flex items-center gap-2">
                <Sun class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-foreground">Dark Mode</span>
              </div>
              <Switch :model-value="themeStore.isDark" @update:model-value="themeStore.toggleTheme" />
            </div>

            <!-- User Menu -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button class="w-full justify-start gap-3 px-3" variant="ghost">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback
                      class="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs"
                    >
                      {{ getUserInitials(authStore.user?.email || '') }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="flex flex-col items-start text-left flex-1 min-w-0">
                    <span class="text-sm font-medium text-foreground truncate w-full">
                      {{ authStore.user?.full_name || 'User' }}
                    </span>
                    <span class="text-xs text-muted-foreground truncate w-full">
                      {{ authStore.user?.email }}
                    </span>
                  </div>
                  <ChevronDown class="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <DropdownMenuItem @click="router.push('/profile')">
                  <User class="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive" @click="handleLogout">
                  <LogOut class="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 min-h-screen">
      <div class="container mx-auto p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Activity,
  ChevronDown,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Sun,
  User,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/api-keys', label: 'API Keys', icon: Key },
  { path: '/usage', label: 'Usage', icon: Activity },
  { path: '/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/playground', label: 'Playground', icon: PlayCircle },
]

function formatCurrency(amount: number) {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' UZS'
  )
}

function getUserInitials(email: string) {
  return email.substring(0, 2).toUpperCase()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
