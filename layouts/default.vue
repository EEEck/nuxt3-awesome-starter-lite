<script setup lang="ts">
const route = useRoute()

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/grading-wizard', label: 'Grading Wizard' },
  { to: '/scan-processor', label: 'Scan Processor' },
  { to: '/ai-assistant', label: 'AI Assistant' },
]

const isActive = (path: string) =>
  route.path === path || (path !== '/' && route.path.startsWith(path))

const year = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div class="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <header class="mb-8 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Grading Platform</h1>
          <nav class="flex flex-wrap items-center gap-3 text-sm font-medium">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              :class="[
                'rounded-full px-4 py-2 transition-colors',
                isActive(link.to)
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70',
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">Currently viewing: {{ route.path }}</p>
      </header>
      <main class="flex-1">
        <slot />
      </main>
      <footer class="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {{ year }} Grading Platform. All rights reserved.
      </footer>
    </div>
  </div>
</template>
