<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore, WIZARD_TOTAL_STEPS } from '~/stores/wizard'
import { useRubricEditStore } from '~/stores/rubricEdit'

const wizard = useWizardStore()
const rubricEdit = useRubricEditStore()

const hasPrev = computed(() => wizard.stepIndex > 0)
const hasNext = computed(() => wizard.stepIndex < WIZARD_TOTAL_STEPS - 1)
const canNext = computed(() => wizard.canNext)

function prev() { if (hasPrev.value) wizard.prev() }
function next() { if (hasNext.value && canNext.value) wizard.next() }
function startOver() { wizard.startOver(); rubricEdit.clearAll() }
</script>

<template>
  <div class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <button type="button" class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" :disabled="!hasPrev" @click="prev">
      Back
    </button>
    <div class="flex items-center gap-3">
      <span class="text-xs text-slate-500 dark:text-slate-400">Step {{ wizard.stepIndex + 1 }} of {{ WIZARD_TOTAL_STEPS }}</span>
      <button type="button" class="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="startOver">
        Start over
      </button>
    </div>
    <button type="button" class="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-400" :disabled="!hasNext || !canNext" @click="next">
      Next
    </button>
  </div>
</template>

<style scoped>
.shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
</style>
