import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AnswersSchema, ResultsSchema, RubricSchema } from '~/lib/schemas'
import type { Answers, Results, Rubric } from '~/lib/schemas'

export const WIZARD_TOTAL_STEPS = 6

const stepOrder = ['profile', 'rubric-upload', 'rubric-edit', 'answers-upload', 'grade', 'results'] as const

export type WizardStep = typeof stepOrder[number]
export type StepAlias = WizardStep | 'scan' | 'review' | 'extract' | 'export'

const stepAliases: Record<StepAlias, WizardStep> = {
  profile: 'profile',
  'rubric-upload': 'rubric-upload',
  'rubric-edit': 'rubric-edit',
  'answers-upload': 'answers-upload',
  grade: 'grade',
  results: 'results',
  scan: 'profile',
  review: 'profile',
  extract: 'answers-upload',
  export: 'results'
}

export const useWizardStore = defineStore('wizard', () => {
  const step = ref(0)
  const profileId = ref<string | null>(null)
  const rubric = ref<Rubric | null>(null)
  const answers = ref<Answers | null>(null)
  const results = ref<Results | null>(null)

  const pdfFile = ref<File | null>(null)
  const selectedPageIndices = ref<number[]>([])

  const canRun = computed(() => Boolean(profileId.value && rubric.value && answers.value))

  function setProfile(id: string | null) {
    profileId.value = id
  }

  function setRubric(payload: unknown) {
    rubric.value = payload ? RubricSchema.parse(payload) : null
  }

  function setAnswers(payload: unknown) {
    answers.value = payload ? AnswersSchema.parse(payload) : null
  }

  function setResults(payload: unknown) {
    results.value = payload ? ResultsSchema.parse(payload) : null
  }

  function setPdf(file: File | null) {
    pdfFile.value = file
    if (!file) {
      selectedPageIndices.value = []
    }
  }

  function setSelectedPages(pages: number[]) {
    selectedPageIndices.value = Array.from(new Set(pages)).sort((a, b) => a - b)
  }

  function next() {
    if (step.value < WIZARD_TOTAL_STEPS - 1) {
      step.value += 1
    }
  }

  function previous() {
    if (step.value > 0) {
      step.value -= 1
    }
  }

  function goTo(target: number) {
    if (target >= 0 && target < WIZARD_TOTAL_STEPS) {
      step.value = target
    }
  }

  function go(name: StepAlias) {
    const normalized = stepAliases[name]
    if (!normalized) return
    const target = stepOrder.indexOf(normalized)
    if (target !== -1) {
      goTo(target)
    }
  }

  function reset() {
    step.value = 0
    profileId.value = null
    rubric.value = null
    answers.value = null
    results.value = null
    setPdf(null)
  }

  return {
    step,
    profileId,
    rubric,
    answers,
    results,
    pdfFile,
    selectedPageIndices,
    canRun,
    setProfile,
    setRubric,
    setAnswers,
    setResults,
    setPdf,
    setSelectedPages,
    next,
    previous,
    goTo,
    go,
    reset,
    totalSteps: WIZARD_TOTAL_STEPS
  }
})

export const useWizard = useWizardStore
