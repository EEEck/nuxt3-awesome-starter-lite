export interface Criterion {
  criterion: string
  max_points: number
}

export interface RubricQuestion {
  question_id: string
  question_text: string
  max_points: number
  question_type?: string
  criteria: Criterion[]
}

export interface ExamRubric {
  exam_name?: string
  rubric_name?: string
  general_instructions?: string
  questions: RubricQuestion[]
}

