<script setup lang="ts">
import { useHead } from '#app'
useHead({ title: 'Choose a Workflow' })
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-8 px-6 py-10">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Choose a Workflow</h1>
    <p class="text-sm text-slate-600 dark:text-slate-300">Pick the flow you want to run. You can use them independently.</p>

    <div class="grid gap-4 md:grid-cols-2">
      <NuxtLink to="/grading-wizard" class="block rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
        <div class="mb-2 flex items-center gap-2">
          <Icon name="lucide:wand-2" class="h-5 w-5 text-brand-600" />
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Grading Wizard</h2>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300">Configure profiles and rubrics, upload answers, run grading, and review results.</p>
        <div class="mt-3 text-xs text-slate-500">Route: /grading-wizard</div>
      </NuxtLink>

      <NuxtLink to="/scan-processor/wizard" class="block rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
        <div class="mb-2 flex items-center gap-2">
          <Icon name="lucide:scan-line" class="h-5 w-5 text-emerald-600" />
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Scan Processor</h2>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300">Upload scanned documents and review AI‑extracted rubric or student answers.</p>
        <div class="mt-3 text-xs text-slate-500">Route: /scan-processor/wizard</div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.shadow-subtle { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
</style>

