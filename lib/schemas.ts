import { z } from 'zod'

export const RubricCriteriaSchema = z.object({
  id: z.string(),
  description: z.string(),
  points: z.number().nonnegative(),
})

export const RubricQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  maxScore: z.number().nonnegative(),
  criteria: z.array(RubricCriteriaSchema).optional(),
})

export const RubricSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(RubricQuestionSchema).min(1, 'At least one question is required'),
})

export type Rubric = z.infer<typeof RubricSchema>

const AnswerMetadataSchema = z.record(z.any()).optional()

const AnswerResponseSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  metadata: AnswerMetadataSchema,
})

const AnswerSubmissionSchema = z.object({
  studentId: z.string(),
  responses: z.array(AnswerResponseSchema),
})

export const AnswersSchema = z.object({
  profileId: z.string().nullable(),
  submissions: z.array(AnswerSubmissionSchema),
})

export type Answers = z.infer<typeof AnswersSchema>

const ResultBreakdownSchema = z.object({
  questionId: z.string(),
  score: z.number(),
  maxScore: z.number().optional(),
  feedback: z.string().optional(),
})

const ResultItemSchema = z.object({
  studentId: z.string(),
  totalScore: z.number(),
  feedback: z.string().optional(),
  breakdown: z.array(ResultBreakdownSchema).optional(),
})

export const ResultsSchema = z.object({
  profileId: z.string(),
  averageScore: z.number(),
  items: z.array(ResultItemSchema),
  generatedAt: z.string().optional(),
})

export type Results = z.infer<typeof ResultsSchema>
