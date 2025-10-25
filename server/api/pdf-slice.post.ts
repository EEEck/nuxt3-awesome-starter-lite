import { PDFDocument } from 'pdf-lib'
import { readMultipartFormData } from 'h3'

function parsePagesSpec(spec?: string | null, totalPages?: number) {
  if (!spec) return null
  const pages = new Set<number>()
  const max = totalPages || Infinity
  for (let token of spec.split(',')) {
    token = token.trim()
    if (!token) continue
    if (token.includes('-')) {
      const [a, b] = token.split('-').map(s => parseInt(s.trim(), 10))
      if (!a || !b) throw new Error(`Invalid range: ${token}`)
      if (a < 1 || b < 1 || a > max || b > max) throw new Error(`Range outside bounds: ${token}`)
      const start = Math.min(a, b)
      const end = Math.max(a, b)
      for (let i = start; i <= end; i++) pages.add(i)
    } else {
      const n = parseInt(token, 10)
      if (!n) throw new Error(`Invalid page number: ${token}`)
      if (n < 1 || n > max) throw new Error(`Page outside bounds: ${token}`)
      pages.add(n)
    }
  }
  return Array.from(pages).sort((a, b) => a - b)
}

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(p => p.name === 'file')
  const pagesSpec = form?.find(p => p.name === 'pages')?.data?.toString('utf8') || ''
  if (!file?.data) { setResponseStatus(event, 400); return { error: 'file is required' } }
  if (!pagesSpec) { setResponseStatus(event, 400); return { error: 'pages is required' } }

  try {
    const src = await PDFDocument.load(file.data)
    const total = src.getPageCount()
    const pages1 = parsePagesSpec(pagesSpec, total)
    if (!pages1 || pages1.length === 0) { setResponseStatus(event, 400); return { error: 'no valid pages' } }
    const subset = await PDFDocument.create()
    const indices0 = pages1.map(n => n - 1)
    const copied = await subset.copyPages(src, indices0)
    copied.forEach(p => subset.addPage(p))
    const bytes = await subset.save()
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="subset.pdf"`)
    return bytes
  } catch (e: any) {
    setResponseStatus(event, 400)
    return { error: e?.message || 'slice failed' }
  }
})

