import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(p => p.name === 'file')
  if (!file) {
    setResponseStatus(event, 400)
    return { detail: 'file is required' }
  }
  const name = file.filename || 'student-scan.pdf'
  const custom = form?.find(p => p.name === 'custom_instructions')?.data?.toString('utf8') || ''
  const pages = form?.find(p => p.name === 'pages')?.data?.toString('utf8') || null

  // Return a deterministic mock extraction
  const now = new Date().toISOString()
  return {
    student_name: 'Alex Johnson',
    answers: {
      Q1: 'H2O is water',
      Q2: 'Photosynthesis occurs in chloroplasts',
      Q3: 'Force = mass × acceleration',
    },
    // Per-question confidence to drive UI styling/auto-flag
    question_confidence: {
      Q1: 0.86, // high
      Q2: 0.58, // low
      Q3: 0.72, // medium
    },
    question_needs_review: {
      Q1: false,
      Q2: true,
      Q3: false,
    },
    confidence: 0.84,
    confidence_level: 'medium',
    confidence_justification: 'Legible handwriting with minor artifacts',
    name_confidence: 0.76,
    needs_review: false,
    processed_page_images: [],
    original_filename: name,
    pages_processed: pages ? pages.split(',').length : 1,
    extraction_method: 'ai_vision',
    custom_instructions: custom,
    updated_at: now,
  }
})
