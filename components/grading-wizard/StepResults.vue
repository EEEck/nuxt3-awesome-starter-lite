<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '~/stores/wizard'

const wizard = useWizardStore()
const results = computed(() => wizard.results)

const startOver = () => {
  wizard.reset()
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 6</p>
      <h2 class="text-2xl font-semibold">Grading Complete</h2>
      <p class="text-slate-600 dark:text-slate-300">Review the outcome from the grading run.</p>
    </header>
    <div
      v-if="results"
      class="space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Profile</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ results.profileId }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-500 dark:text-slate-400">Average Score</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ results.averageScore }}</p>
        </div>
      </div>
      <ul class="divide-y divide-slate-200 dark:divide-slate-800">
        <li v-for="item in results.items" :key="item.studentId" class="py-3">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ item.studentId }}</span>
            <span class="text-sm text-slate-500">{{ item.totalScore }} pts</span>
          </div>
          <p class="text-sm text-slate-500">{{ item.feedback }}</p>
        </li>
      </ul>
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
