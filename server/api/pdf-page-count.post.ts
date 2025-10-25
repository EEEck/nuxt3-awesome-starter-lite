import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(p => p.name === 'file')
  if (!file || !file.data) {
    setResponseStatus(event, 400)
    return { error: 'file not provided' }
  }
  // Very rough estimate by size when we cannot parse pages
  const kb = Math.max(1, Math.round(file.data.length / 1024))
  let pageCount = 1
  if (kb < 150) pageCount = Math.max(1, Math.ceil(kb / 100))
  else if (kb < 500) pageCount = Math.max(2, Math.ceil(kb / 120))
  else pageCount = Math.max(3, Math.ceil(kb / 150))
  return { page_count: pageCount }
})

