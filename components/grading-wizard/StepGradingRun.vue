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
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 5</p>
      <h2 class="text-2xl font-semibold">Run automated grading</h2>
      <p class="text-slate-600 dark:text-slate-300">
        We will send the rubric and student answers to the grading engine. This may take a few moments.
      </p>
    </header>
    <div class="rounded border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Grading requests will be queued and processed by the backend service. For now we simulate the request in tests.
      </p>
    </div>
    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      :disabled="!isReady || grading.isPending.value"
      @click="runGrading"
    >
      <span v-if="grading.isPending.value">Running…</span>
      <span v-else>Next</span>
    </button>
    <p v-if="grading.isError.value" class="text-sm text-red-500">
      {{ grading.error.value?.message || 'Unable to start grading.' }}
    </p>
  </section>
</template>
