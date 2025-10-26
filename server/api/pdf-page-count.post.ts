import { readMultipartFormData } from 'h3'
import { PDFDocument } from 'pdf-lib'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(p => p.name === 'file')
  if (!file || !file.data) {
    setResponseStatus(event, 400)
    return { error: 'file not provided' }
  }
  // Try accurate page count via pdf-lib; fall back to heuristic
  try {
    const pdf = await PDFDocument.load(file.data as Uint8Array, { updateMetadata: false })
    const count = pdf.getPages().length
    if (Number.isFinite(count) && count > 0) return { page_count: count }
  } catch {}

  const kb = Math.max(1, Math.round((file.data as Buffer).length / 1024))
  let pageCount = 1
  if (kb < 150) pageCount = Math.max(1, Math.ceil(kb / 100))
  else if (kb < 500) pageCount = Math.max(2, Math.ceil(kb / 120))
  else pageCount = Math.max(3, Math.ceil(kb / 150))
  return { page_count: pageCount }
})
