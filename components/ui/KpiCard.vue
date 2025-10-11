<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string
  change?: string
  changeTone?: 'positive' | 'negative' | 'neutral'
  description?: string
}>()

const changeClasses = computed(() => {
  switch (props.changeTone) {
    case 'positive':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'negative':
      return 'text-rose-600 dark:text-rose-400'
    default:
      return 'text-slate-500 dark:text-slate-400'
  }
})
</script>

<template>
  <article class="flex flex-col justify-between gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
    <header class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{{ props.label }}</p>
      <p class="font-display text-3xl font-semibold text-slate-900 dark:text-white">{{ props.value }}</p>
    </header>
    <footer class="space-y-1 text-sm">
      <p v-if="props.change" :class="changeClasses">{{ props.change }}</p>
      <p v-if="props.description" class="text-slate-500 dark:text-slate-400">{{ props.description }}</p>
    </footer>
  </article>
</template>
