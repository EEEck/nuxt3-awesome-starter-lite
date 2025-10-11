<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  links: Array<{ to: string; label: string; description?: string }>
  betaLabel?: string
}>()

const route = useRoute()
const year = computed(() => new Date().getFullYear())

const isActive = (path: string) =>
  route.path === path || (path !== '/' && route.path.startsWith(path))
</script>

<template>
  <div class="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:rounded-full focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>
    <header class="border-b border-white/80 bg-white/80 backdrop-blur">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 text-left">
          <LogoMark />
          <div>
            <p class="font-display text-xl font-semibold tracking-tight text-slate-900">Grading Wizard</p>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">AI Teaching Ops</p>
          </div>
        </NuxtLink>
        <nav class="hidden items-center gap-2 text-sm font-medium text-slate-600 md:flex">
          <NuxtLink
            v-for="link in props.links"
            :key="link.to"
            :to="link.to"
            class="inline-flex items-center gap-2 rounded-full px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            :class="[
              isActive(link.to)
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'text-slate-600 hover:bg-slate-200/70',
            ]"
          >
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-3">
          <div
            v-if="props.betaLabel !== undefined"
            class="hidden rounded-full border border-brand-400/40 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 shadow-sm md:inline-flex"
          >
            {{ props.betaLabel }}
          </div>
          <button
            type="button"
            class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 md:inline-flex"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            Synced
          </button>
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            aria-label="Open profile menu"
          >
            <span class="font-display text-base">JL</span>
          </button>
        </div>
      </div>
      <div class="md:hidden">
        <nav class="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-6 pb-4 text-sm font-medium text-slate-600">
          <NuxtLink
            v-for="link in props.links"
            :key="link.to"
            :to="link.to"
            class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            :class="[
              isActive(link.to)
                ? 'bg-slate-900 text-white shadow-subtle'
                : 'bg-white/60 text-slate-600 hover:bg-slate-200/70',
            ]"
          >
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-white/60 bg-white/70 py-8 text-sm text-slate-500 backdrop-blur">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="font-semibold text-slate-700">© {{ year }} Grading Wizard. All rights reserved.</p>
          <p class="text-xs text-slate-500">
            Designed for secure, enterprise-ready AI experiences in education.
          </p>
        </div>
        <div class="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          <NuxtLink to="/ai-assistant" class="hover:text-slate-900">Assistant</NuxtLink>
          <NuxtLink to="/grading-wizard" class="hover:text-slate-900">Wizard</NuxtLink>
          <NuxtLink to="/scan-processor" class="hover:text-slate-900">Pipeline</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
