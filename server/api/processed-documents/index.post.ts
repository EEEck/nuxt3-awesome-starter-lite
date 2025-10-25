function getDb() {
  const g = globalThis as any
  if (!g.__PROC_DOCS__) g.__PROC_DOCS__ = new Map<string, any>()
  return g.__PROC_DOCS__ as Map<string, any>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const id = (globalThis.crypto as any)?.randomUUID?.() ?? `doc_${Date.now()}`
  const doc = { ...body, document_id: id, updated_at: new Date().toISOString() }
  getDb().set(id, doc)
  return { document_id: id }
})

