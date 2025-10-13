export default defineEventHandler(async (event) => {
  // const { rubric, submissions, context } = await readBody(event)
  // TODO: forward to your FastAPI service; for now return a mock
  return {
    total_score: 12, max_score: 20,
    question_grades: [
      { question_id: 'q1', score: 6, max_points: 10 },
      { question_id: 'q2', score: 6, max_points: 10 },
    ],
    per_student: { student_001: { score: 12, max: 20 } }
  }
})
