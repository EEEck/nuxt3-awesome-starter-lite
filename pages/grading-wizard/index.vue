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
  <div class="space-y-8 pb-16">
    <PageHeader
      eyebrow="Guided automation"
      :title="stepName"
      description="Configure grading policies, upload assets, and review AI output with crisp guardrails."
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          @click="wizard.reset()"
        >
          Reset wizard
        </button>
      </template>
    </PageHeader>

    <section class="space-y-6 px-6">
      <div class="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-1 flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 md:flex-row md:items-center">
          <span class="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Progress</span>
          <div class="flex flex-1 items-center gap-3">
            <span>Step {{ wizard.step + 1 }} of {{ WIZARD_TOTAL_STEPS }}</span>
            <div class="h-2 flex-1 rounded-full bg-slate-200/80 dark:bg-slate-800/70">
              <div
                class="h-2 rounded-full bg-brand-500 transition-all dark:bg-brand-400"
                :style="{ width: `${progress}%` }"
                role="progressbar"
                :aria-valuenow="progress"
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span class="font-semibold text-slate-900 dark:text-white">{{ progress }}%</span>
          </div>
        </div>
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          Review pipeline status
        </NuxtLink>
      </div>

      <component :is="currentComponent" />
    </section>
  </div>
</template>
