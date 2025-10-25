function getDb() {
  const g = globalThis as any
  if (!g.__PROC_DOCS__) g.__PROC_DOCS__ = new Map<string, any>()
  return g.__PROC_DOCS__ as Map<string, any>
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) { setResponseStatus(event, 400); return { error: 'missing id' } }
  const db = getDb()
  if (!db.has(id)) { setResponseStatus(event, 404); return { error: 'not found' } }
  return db.get(id)
})

