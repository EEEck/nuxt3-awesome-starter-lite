import { useMutation } from '@tanstack/vue-query'
import type { MutationOptions } from '@tanstack/vue-query'
import { useApi } from '~/composables/useApi'
import { AnswersSchema, ResultsSchema, RubricSchema } from '~/lib/schemas'
import type { Answers, Results, Rubric } from '~/lib/schemas'

export interface GradePayload {
  profileId: string | null
  rubric: Rubric | null
  answers: Answers | null
}

/**
 * Runtime validation ensures our frontend stays aligned with evolving backend contracts,
 * catching mismatches early so we can iterate on API integrations before they impact users.
 */
export const useGrading = (options: MutationOptions<Results, Error, GradePayload> = {}) => {
  const api = useApi()

  return useMutation<Results, Error, GradePayload>({
    mutationFn: async (payload) => {
      let parsedRubric: Rubric | null = null
      let parsedAnswers: Answers | null = null

      try {
        parsedRubric = payload.rubric ? RubricSchema.parse(payload.rubric) : null
        parsedAnswers = payload.answers ? AnswersSchema.parse(payload.answers) : null
      } catch (error) {
        console.warn('Invalid grading payload:', error)
        throw error
      }

      const result = await api<unknown>('/api/grade/exam', {
        method: 'POST',
        body: {
          ...payload,
          rubric: parsedRubric,
          answers: parsedAnswers,
        },
      })

      const validatedResult = ResultsSchema.safeParse(result)

      if (!validatedResult.success) {
        console.warn('Invalid grading response:', validatedResult.error)
        throw validatedResult.error
      }

      return validatedResult.data
    },
    ...options,
  })
}
