import { useMutation } from '@tanstack/vue-query'
import type { MutationOptions } from '@tanstack/vue-query'
import { useApi } from '~/composables/useApi'
import { ResultsSchema } from '~/lib/schemas'
import type { Answers, Results, Rubric } from '~/lib/schemas'

export interface GradePayload {
  profileId: string | null
  rubric: Rubric | null
  answers: Answers | null
}

export const useGrading = (options: MutationOptions<Results, Error, GradePayload> = {}) => {
  const api = useApi()

  return useMutation<Results, Error, GradePayload>({
    mutationFn: async (payload) => {
      const result = await api<unknown>('/api/grade/exam', {
        method: 'POST',
        body: payload,
      })

      return ResultsSchema.parse(result)
    },
    ...options,
  })
}
