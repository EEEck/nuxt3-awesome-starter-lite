<script setup lang="ts">
import { ref } from 'vue'
import { useWizardStore } from '~/stores/wizard'
import { AnswersSchema } from '~/lib/schemas'

const wizard = useWizardStore()
const fallbackAnswers = {
  profileId: wizard.profileId,
  submissions: [
    {
      studentId: 's-001',
      responses: [
        { questionId: 'q1', answer: '42', metadata: { confidence: 0.8 } },
      ],
    },
  ],
}

const answersText = ref(JSON.stringify(wizard.answers ?? fallbackAnswers, null, 2))
const error = ref<string | null>(null)

const uploadAnswers = () => {
  error.value = null
  try {
    const raw = JSON.parse(answersText.value)
    const parsed = AnswersSchema.safeParse(raw)
    if (!parsed.success) {
      error.value = parsed.error.issues[0]?.message ?? 'Answers are invalid.'
      return
    }
    wizard.setAnswers(parsed.data)
    wizard.next()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to read answers.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 4</p>
      <h2 class="text-2xl font-semibold">Upload Student Answers</h2>
      <p class="text-slate-600 dark:text-slate-300">Upload JSON containing student responses to exam questions.</p>
    </header>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Answers JSON</label>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Expected format: [{"studentId": "s-001", "responses": [{"questionId": "q1", "answer": "..."}]}]</p>
      <textarea
        v-model="answersText"
        rows="8"
        class="w-full rounded border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700"
      />
      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    </div>
    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
      @click="uploadAnswers"
    >
      Next
    </button>
  </section>
</template>
