import { defineEventHandler, readBody } from 'h3'
import { AnswersSchema, ResultsSchema } from '~/lib/schemas'
import type { Answers } from '~/lib/schemas'

export default defineEventHandler(async (event) => {
  const payload = await readBody(event)
  const answersResult = AnswersSchema.safeParse(payload?.answers)
  const answers: Answers | null = answersResult.success ? answersResult.data : null

  const response = {
    profileId: payload?.profileId ?? 'unknown-profile',
    averageScore: 0,
    items:
      answers?.submissions.map((submission) => ({
        studentId: submission.studentId,
        totalScore: submission.responses.length * 5,
        feedback: 'Auto-generated preview feedback.',
        breakdown: submission.responses.map((response) => ({
          questionId: response.questionId,
          score: 5,
          feedback: `Answer ${response.answer} reviewed.`,
        })),
      })) ?? [],
    generatedAt: new Date().toISOString(),
  }

  if (response.items.length) {
    response.averageScore =
      response.items.reduce((total, item) => total + item.totalScore, 0) / response.items.length
  }

  return ResultsSchema.parse(response)
})
