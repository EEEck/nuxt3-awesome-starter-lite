<script setup lang="ts">
import { computed } from 'vue'
import StepProfile from '~/components/grading-wizard/StepProfile.vue'
import StepRubricUpload from '~/components/grading-wizard/StepRubricUpload.vue'
import StepRubricEdit from '~/components/grading-wizard/StepRubricEdit.vue'
import StepAnswersUpload from '~/components/grading-wizard/StepAnswersUpload.vue'
import StepGradingRun from '~/components/grading-wizard/StepGradingRun.vue'
import StepResults from '~/components/grading-wizard/StepResults.vue'
import { useWizardStore, WIZARD_TOTAL_STEPS } from '~/stores/wizard'

const wizard = useWizardStore()

const steps = [
  { name: 'Profile', component: StepProfile },
  { name: 'Rubric Upload', component: StepRubricUpload },
  { name: 'Rubric Review', component: StepRubricEdit },
  { name: 'Answers Upload', component: StepAnswersUpload },
  { name: 'Run Grading', component: StepGradingRun },
  { name: 'Results', component: StepResults },
]

const currentComponent = computed(() => steps[wizard.step]?.component ?? StepProfile)
const stepName = computed(() => steps[wizard.step]?.name ?? steps[0]!.name)
const progress = computed(() => Math.round(((wizard.step + 1) / WIZARD_TOTAL_STEPS) * 100))
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Grading Wizard</p>
      <h2 class="text-3xl font-semibold">{{ stepName }}</h2>
      <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
        <span>Step {{ wizard.step + 1 }} of {{ WIZARD_TOTAL_STEPS }}</span>
        <div class="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            class="h-2 rounded-full bg-slate-900 transition-all dark:bg-white"
            :style="{ width: `${progress}%` }"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
        <span>{{ progress }}%</span>
      </div>
    </header>
    <component :is="currentComponent" />
  </div>
</template>
