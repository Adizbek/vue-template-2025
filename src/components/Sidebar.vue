<script lang="ts" setup>
import { cn, formatCurrency, getUserInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BarChart2,
  ChevronDown,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Play,
  Settings,
  Sun,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

const navigationItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/playground', icon: Play, label: 'Playground' },
  { path: '/api-keys', icon: KeyRound, label: 'API Keys' },
  { path: '/usage', icon: BarChart2, label: 'Usage' },
  { path: '/transactions', icon: CreditCard, label: 'Transactions' },
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div
    :class="
      cn(
        'hidden border-r border-border/30 bg-background/40 backdrop-blur-xl md:block',
        $attrs.class as string,
      )
    "
  >
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-16 items-center border-b border-border/30 px-6">
        <router-link class="flex items-center gap-2 font-semibold" to="/">
          <h1
            class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            NeuronAI
          </h1>
        </router-link>
      </div>
      <div class="flex-1 overflow-y-auto">
        <nav class="grid items-start px-4 text-sm font-medium pt-4">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            v-slot="{ isActive }"
            :to="item.path"
          >
            <div
              :class="[
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all mb-1',
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted/50',
              ]"
            >
              <component
                class="shrink-0 size-5"
                :is="item.icon"
                :class="[isActive ? 'text-primary-foreground' : 'text-foreground']"
              />
              <span>{{ item.label }}</span>
            </div>
          </router-link>
        </nav>
        <div class="mx-3 my-4">
          <Card
            class="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 backdrop-blur-sm"
          >
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium text-muted-foreground"> Balance </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-foreground">
                {{ formatCurrency(authStore.user?.balance || 0) }}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div class="mt-auto p-4 border-t border-border/30">
        <div class="flex items-center justify-between px-3 py-2 mb-2">
          <div class="flex items-center gap-2">
            <Sun :stroke-width="2" class="h-5 w-5 text-muted-foreground" />
            <span class="text-sm text-foreground">Dark Mode</span>
          </div>
          <Switch :model-value="themeStore.isDark" @update:model-value="themeStore.toggleTheme" />
        </div>
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
              <ChevronDown :stroke-width="2" class="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem @click="router.push('/profile')">
              <Settings :stroke-width="2" class="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @click="handleLogout">
              <LogOut :stroke-width="2" class="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>
