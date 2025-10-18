<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '~/stores/wizard'
import { useGrading } from '~/composables/useGrading'

const wizard = useWizardStore()
const grading = useGrading()

const isReady = computed(() => wizard.canRun)

const runGrading = () => {
  if (!isReady.value || grading.isPending.value) {
    return
  }

  grading.mutate(
    {
      profileId: wizard.profileId,
      rubric: wizard.rubric,
      answers: wizard.answers,
    },
    {
      onSuccess(data) {
        wizard.setResults(data)
        wizard.next()
      },
    },
  )
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 5</p>
      <h2 class="text-2xl font-semibold">AI Grading in Progress</h2>
      <p class="text-slate-600 dark:text-slate-300">
        Your rubric and student answers are being processed by AI.
      </p>
    </header>

    <div class="rounded border border-slate-300 p-6 dark:border-slate-700">
      <div class="flex items-center gap-3 mb-3">
        <span class="inline-block h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
        <span class="text-slate-700 dark:text-slate-200">AI Processing</span>
      </div>
      <div class="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div class="h-2 bg-teal-500 transition-all" :style="{ width: grading.isPending.value ? '60%' : '0%' }"></div>
      </div>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        This may take a few moments.
      </p>
    </div>

    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      :disabled="!isReady || grading.isPending.value"
      @click="runGrading"
    >
      <span v-if="grading.isPending.value">Running…</span>
      <span v-else>Start Grading</span>
    </button>
    <p v-if="grading.isError.value" class="text-sm text-red-500">
      {{ grading.error.value?.message || 'Unable to start grading.' }}
    </p>
  </section>
  
</template>
