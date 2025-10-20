<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWizardStore } from '~/stores/wizard'

const wizard = useWizardStore()
const results = computed(() => wizard.results)
const items = computed(() => results.value?.items ?? [])
const totalStudents = computed(() => items.value.length)
const highestScore = computed(() => items.value.reduce((max, item) => Math.max(max, item.totalScore ?? 0), 0))
const lowestScore = computed(() => items.value.reduce((min, item) => Math.min(min, item.totalScore ?? Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY))
const expanded = ref<Record<string, boolean>>({})

const toggleBreakdown = (studentId: string) => {
  expanded.value = {
    ...expanded.value,
    [studentId]: !expanded.value[studentId],
  }
}

const startOver = () => {
  wizard.reset()
}

const hasBreakdown = (studentId: string) => {
  const item = items.value.find((entry) => entry.studentId === studentId)
  return !!item?.breakdown?.length
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 6</p>
      <h2 class="text-2xl font-semibold">Grading Complete</h2>
      <p class="text-slate-600 dark:text-slate-300">Review the outcome from the grading run.</p>
    </header>

    <div v-if="results" class="space-y-6">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Profile</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ results.profileId || 'N/A' }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average Score</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ results.averageScore ?? '—' }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Students Graded</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ totalStudents }}</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2" v-if="items.length">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Highest Score</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ highestScore || '—' }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Lowest Score</p>
          <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ lowestScore === Number.POSITIVE_INFINITY ? '—' : lowestScore }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Per Student Results</h3>
        <div v-for="item in items" :key="item.studentId" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.studentId }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.feedback || 'No feedback provided.' }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Score</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ item.totalScore }}</p>
            </div>
          </div>
          <div v-if="hasBreakdown(item.studentId)" class="mt-3">
            <button type="button" class="text-sm font-medium text-brand-600 hover:text-brand-500" @click="toggleBreakdown(item.studentId)">
              {{ expanded[item.studentId] ? 'Hide detailed breakdown' : 'View detailed breakdown' }}
            </button>
            <div v-if="expanded[item.studentId]" class="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                <thead class="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Question</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Score</th>
                    <th class="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Feedback</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr v-for="entry in item.breakdown" :key="entry.questionId" class="bg-white dark:bg-slate-900">
                    <td class="px-4 py-2 text-slate-700 dark:text-slate-200">{{ entry.questionId }}</td>
                    <td class="px-4 py-2 text-slate-700 dark:text-slate-200">{{ entry.score }}<span v-if="entry.maxScore"> / {{ entry.maxScore }}</span></td>
                    <td class="px-4 py-2 text-slate-600 dark:text-slate-400">{{ entry.feedback || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-slate-500">No results yet. Run grading to generate them.</p>

    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
      @click="startOver"
    >
      Start over
    </button>
  </section>
</template>
