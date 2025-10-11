import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AnswersSchema, ResultsSchema, RubricSchema } from '~/lib/schemas'
import type { Answers, Results, Rubric } from '~/lib/schemas'

export const WIZARD_TOTAL_STEPS = 6

export const useWizardStore = defineStore('wizard', () => {
  const step = ref(0)
  const profileId = ref<string | null>(null)
  const rubric = ref<Rubric | null>(null)
  const answers = ref<Answers | null>(null)
  const results = ref<Results | null>(null)

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

  function reset() {
    step.value = 0
    profileId.value = null
    rubric.value = null
    answers.value = null
    results.value = null
  }

  return {
    step,
    profileId,
    rubric,
    answers,
    results,
    canRun,
    setProfile,
    setRubric,
    setAnswers,
    setResults,
    next,
    previous,
    goTo,
    reset,
    totalSteps: WIZARD_TOTAL_STEPS,
  }
})
