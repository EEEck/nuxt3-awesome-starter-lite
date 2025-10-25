<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StepProfile from '~/components/grading-wizard/StepProfile.vue'
import StepRubricUpload from '~/components/grading-wizard/StepRubricUpload.vue'
import StepRubricEdit from '~/components/grading-wizard/StepRubricEdit.vue'
import StepAnswersUpload from '~/components/grading-wizard/StepAnswersUpload.vue'
import StepGradingRun from '~/components/grading-wizard/StepGradingRun.vue'
import StepResults from '~/components/grading-wizard/StepResults.vue'
import WizardFooter from '~/components/grading-wizard/WizardFooter.vue'
import { useWizardStore, WIZARD_TOTAL_STEPS, WIZARD_STEPS } from '~/stores/wizard'
import { useRubricEditStore } from '~/stores/rubricEdit'

const wizard = useWizardStore()
const rubricEdit = useRubricEditStore()

const componentsMap: Record<string, any> = {
  profile: StepProfile,
  'rubric-upload': StepRubricUpload,
  'rubric-edit': StepRubricEdit,
  'answers-upload': StepAnswersUpload,
  grade: StepGradingRun,
  results: StepResults,
}

const labels: Record<string, string> = {
  profile: 'Profile',
  'rubric-upload': 'Rubric Upload',
  'rubric-edit': 'Rubric Review',
  'answers-upload': 'Answers Upload',
  grade: 'Run Grading',
  results: 'Results',
}

const safeIndex = computed(() => {
  const i = WIZARD_STEPS.indexOf(wizard.step as any)
  return i >= 0 ? i : 0
})

const currentComponent = computed(() => componentsMap[wizard.step] ?? StepProfile)
const stepName = computed(() => labels[wizard.step] ?? 'Wizard')
const progress = computed(() => Math.round(((safeIndex.value + 1) / WIZARD_TOTAL_STEPS) * 100))

function handleStartOver() {
  wizard.startOver()
  rubricEdit.clearAll()
}

// Optional: load processed document by id from query
const route = useRoute()
onMounted(async () => {
  const docId = route.query.doc as string | undefined
  const type = (route.query.type as string | undefined) as ('student'|'rubric'|undefined)
  if (!docId) return
  try {
    const doc: any = await $fetch(`/api/processed-documents/${encodeURIComponent(docId)}`)
    const uploadType = (type || doc?.upload_type) as 'student'|'rubric'|undefined
    if (uploadType === 'rubric') {
      wizard.setRubric(doc)
      wizard.go('rubric-edit')
    } else if (uploadType === 'student') {
      // map to Answers schema (single submission)
      const answersMap = doc?.answers || {}
      const responses = Object.entries(answersMap).map(([questionId, answer]: any) => ({ questionId: String(questionId), answer }))
      const payload = { profileId: wizard.profileId ?? null, submissions: [{ studentId: doc?.student_name || 'student', responses }] }
      wizard.setAnswers(payload)
      wizard.go('answers-upload')
    }
  } catch (e) {
    // ignore fetch errors
  }
})
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
          @click="handleStartOver"
        >
          Start over
        </button>
      </template>
    </PageHeader>

    <section class="space-y-6 px-6">
      <div class="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-1 flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 md:flex-row md:items-center">
          <span class="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Progress</span>
          <div class="flex flex-1 items-center gap-3">
            <span>Step {{ safeIndex + 1 }} of {{ WIZARD_TOTAL_STEPS }}</span>
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

      <WizardFooter />
    </section>
  </div>
</template>
