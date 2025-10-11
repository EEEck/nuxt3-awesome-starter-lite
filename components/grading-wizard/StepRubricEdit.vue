<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '~/stores/wizard'

const wizard = useWizardStore()
const rubric = computed(() => wizard.rubric)

const goNext = () => {
  wizard.next()
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
      <h2 class="text-2xl font-semibold">Review rubric details</h2>
      <p class="text-slate-600 dark:text-slate-300">
        Confirm the questions and scoring weights below. Editing tools will be added soon.
      </p>
    </header>
    <div
      v-if="rubric"
      class="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 class="text-lg font-semibold">{{ rubric.title }}</h3>
      <ul class="space-y-3">
        <li v-for="question in rubric.questions" :key="question.id" class="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ question.prompt }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Max score: {{ question.maxScore }}</p>
            </div>
          </div>
          <ul v-if="question.criteria?.length" class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li v-for="criterion in question.criteria" :key="criterion.id" class="flex items-center justify-between">
              <span>{{ criterion.description }}</span>
              <span class="font-medium">{{ criterion.points }} pts</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <p v-else class="text-sm text-slate-500">No rubric loaded yet.</p>
    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
      :disabled="!rubric"
      @click="goNext"
    >
      Next
    </button>
  </section>
</template>
