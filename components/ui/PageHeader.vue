<script setup lang="ts">
const props = defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="flex flex-col gap-6 border-b border-white/70 bg-white/70 px-6 py-10 shadow-sm backdrop-blur dark:border-white/5 dark:bg-slate-950/60 sm:rounded-3xl sm:px-10">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div class="max-w-2xl space-y-3">
        <p v-if="props.eyebrow" class="text-xs font-semibold uppercase tracking-[0.35em] text-brand-600 dark:text-brand-300">
          {{ props.eyebrow }}
        </p>
        <h1 class="font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {{ props.title }}
        </h1>
        <p v-if="props.description" class="text-base text-slate-600 dark:text-slate-300">
          {{ props.description }}
        </p>
      </div>
      <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
