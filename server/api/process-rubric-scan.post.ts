import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(p => p.name === 'file')
  if (!file) {
    setResponseStatus(event, 400)
    return { detail: 'file is required' }
  }
  const name = file.filename || 'rubric.pdf'
  const custom = form?.find(p => p.name === 'custom_instructions')?.data?.toString('utf8') || ''
  const pages = form?.find(p => p.name === 'pages')?.data?.toString('utf8') || null

  const now = new Date().toISOString()
  return {
    exam_name: 'Unit 2: Biology Basics',
    general_instructions: 'Show work where applicable. Partial credit is possible.',
    questions: [
      {
        question_id: 'Q1',
        question_text: 'Explain the process of photosynthesis.',
        max_points: 5,
        criteria: [
          { criterion: 'Mentions chloroplasts', max_points: 2 },
          { criterion: 'Includes chemical equation', max_points: 2 },
          { criterion: 'Describes light dependency', max_points: 1 },
        ],
      },
      {
        question_id: 'Q2',
        question_text: 'Define osmosis and provide an example.',
        max_points: 5,
        criteria: [
          { criterion: 'Correct definition', max_points: 3 },
          { criterion: 'Example relevant', max_points: 2 },
        ],
      },
    ],
    confidence: 0.9,
    confidence_level: 'high',
    confidence_justification: 'Clear structured rubric detected',
    needs_review: false,
    processed_page_images: [],
    original_filename: name,
    pages_processed: pages ? pages.split(',').length : 1,
    extraction_method: 'ai_vision',
    custom_instructions: custom,
    updated_at: now,
  }
})

