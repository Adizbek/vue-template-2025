<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

type ResourceLink = {
  label: string
  description: string
  href: string
}

const resources: ResourceLink[] = [
  {
    label: 'Vue Router',
    description: 'Learn how to add more pages and navigation patterns.',
    href: 'https://router.vuejs.org/guide/',
  },
  {
    label: 'Vite Docs',
    description: 'Understand how this template is bundled and configured.',
    href: 'https://vite.dev/guide/',
  },
  {
    label: 'Pinia Store',
    description: 'See the example store that ships with this template.',
    href: 'https://pinia.vuejs.org/introduction.html',
  },
]
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
    <section class="space-y-3 text-center">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Example route</p>
      <h1 class="text-4xl font-semibold tracking-tight">Index Page</h1>
      <p class="text-base text-muted-foreground">
        You can use <code>/index</code> as a reference when wiring up your own routes.
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <a
        v-for="resource in resources"
        :key="resource.href"
        :href="resource.href"
        target="_blank"
        rel="noreferrer"
        class="group rounded-xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/60 hover:shadow"
      >
        <p class="font-medium tracking-tight group-hover:text-primary">{{ resource.label }}</p>
        <p class="text-sm text-muted-foreground">
          {{ resource.description }}
        </p>
      </a>
    </section>

    <Button
      variant="outline" @click="() => {
      toast('Event has been created', {
        description: 'Sunday, December 03, 2023 at 9:00 AM',
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      })
    }"
    >
      Add to calendar
    </Button>
  </main>
</template>
