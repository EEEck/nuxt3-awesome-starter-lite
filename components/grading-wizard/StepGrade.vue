<script setup lang="ts">
import { useWizard } from '~/stores/wizard'
const wiz = useWizard()

async function runGrade() {
  if (!wiz.rubric) return
  wiz.setBusy(true)
  try {
    const res = await $fetch('/api/grade/exam', {
      method: 'POST',
      body: {
        rubric: wiz.rubric,
        submissions: wiz.extract?.submissions ?? { student_001: { q1: 'H2O', q2: 'NaCl' } },
        context: { subject: 'chemistry' }
      }
    })
    wiz.setResults(res as any)
  } catch (e:any) {
    wiz.fail(e?.message ?? 'grading failed')
  } finally { wiz.setBusy(false) }
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Grading</h2>
    <button class="btn" :disabled="$pinia.state.value.wizard.busy" @click="runGrade">Run Grading</button>

    <div v-if="$pinia.state.value.wizard.results" class="rounded border p-3">
      <details>
        <summary class="cursor-pointer">Per-student results</summary>
        <ul class="mt-2 list-disc pl-6">
          <li v-for="(v, sid) in ($pinia.state.value.wizard.results?.per_student || {})" :key="sid">
            {{ sid }} — {{ v.score }} / {{ v.max }}
          </li>
        </ul>
      </details>

      <details class="mt-3">
        <summary class="cursor-pointer">Per-question breakdown</summary>
        <ul class="mt-2 list-disc pl-6">
          <li v-for="q in ($pinia.state.value.wizard.results?.question_grades || [])" :key="q.question_id">
            {{ q.question_id }} — {{ q.score }} / {{ q.max_points }}
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<style scoped>
.btn { @apply rounded border px-3 py-1 text-sm hover:bg-gray-50; }
</style>
