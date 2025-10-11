<script setup lang="ts">
const route = useRoute()

const currentYear = new Date().getFullYear()

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/grading-wizard', label: 'Grading Wizard' },
  { to: '/scan-processor', label: 'Scan Processor' },
  { to: '/ai-assistant', label: 'AI Assistant' },
]

const getLinkClasses = (path: string) =>
  route.path.startsWith(path) ? 'bg-gray-100 font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <NuxtLink to="/dashboard" class="text-lg font-semibold text-slate-900">
            Grading Wizard
          </NuxtLink>
          <nav class="flex flex-wrap items-center gap-2 text-sm">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="rounded-md px-3 py-2 transition"
              :class="getLinkClasses(link.to)"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
        <p class="text-sm text-slate-500">Path: {{ route.path }}</p>
      </div>
    </header>

    <main id="main-content" class="flex-1 bg-slate-50">
      <div class="mx-auto w-full max-w-6xl px-6 py-10">
        <slot />
      </div>
    </main>

    <footer class="border-t border-slate-200 bg-white py-6 text-sm text-slate-500">
      <div class="mx-auto w-full max-w-6xl px-6">
        © {{ currentYear }} Grading Wizard
      </div>
    </footer>
  </div>
</template>
