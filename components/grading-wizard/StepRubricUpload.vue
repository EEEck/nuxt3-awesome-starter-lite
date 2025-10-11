<script setup lang="ts">
import { ref } from 'vue'
import { useWizardStore } from '~/stores/wizard'
import { RubricSchema } from '~/lib/schemas'

const wizard = useWizardStore()
const fallbackRubric = {
  title: 'Sample Rubric',
  questions: [
    {
      id: 'q1',
      prompt: 'Solve the equation shown on the sheet.',
      maxScore: 10,
      criteria: [
        { id: 'c1', description: 'Correct method', points: 5 },
        { id: 'c2', description: 'Accurate solution', points: 5 },
      ],
    },
  ],
}

const rubricText = ref(JSON.stringify(wizard.rubric ?? fallbackRubric, null, 2))
const error = ref<string | null>(null)

const uploadRubric = () => {
  error.value = null
  try {
    const raw = JSON.parse(rubricText.value)
    const parsed = RubricSchema.safeParse(raw)
    if (!parsed.success) {
      error.value = parsed.error.issues[0]?.message ?? 'Rubric is invalid.'
      return
    }
    wizard.setRubric(parsed.data)
    wizard.next()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to read rubric.'
  }
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
      <h2 class="text-2xl font-semibold">Upload or paste a rubric</h2>
      <p class="text-slate-600 dark:text-slate-300">
        Paste rubric JSON to describe the scoring criteria for each question. You can refine it in the next step.
      </p>
    </header>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Rubric JSON</label>
      <textarea
        v-model="rubricText"
        rows="8"
        class="w-full rounded border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700"
      />
      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    </div>
    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
      @click="uploadRubric"
    >
      Next
    </button>
  </section>
</template>
