<script setup lang="ts">
import { computed } from 'vue'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
    :aria-pressed="isDark"
    @click="toggle"
  >
    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[0.65rem] text-white transition dark:bg-amber-300 dark:text-slate-900">
      <span v-if="isDark" aria-hidden="true">☾</span>
      <span v-else aria-hidden="true">☀</span>
    </span>
    <span class="hidden sm:inline">{{ isDark ? 'Dark' : 'Light' }} mode</span>
    <span class="sm:hidden">{{ isDark ? 'Dark' : 'Light' }}</span>
  </button>
</template>
