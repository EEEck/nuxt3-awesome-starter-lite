// --- State ---
let pdfBytes = null
let pdfPageCount = null         // If you wire pdf.js you can set the real count.
let selectedPages = []          // 0-based indices.
const embed = document.getElementById('pdf-embed')

// --- Elements ---
const selTypeEl   = document.getElementById('page-selection-type')
const customWrap  = document.getElementById('custom-range-input')
const customInput = document.getElementById('custom-pages')
const valErrEl    = document.getElementById('range-validation')
const valOkEl     = document.getElementById('range-ok')
const chipsEl     = document.getElementById('selected-chips')
const btnAll      = document.getElementById('select-all')
const btnClear    = document.getElementById('clear')

// --- Helpers ---
function renderChips() {
  chipsEl.innerHTML = selectedPages
    .map(i => `<span class="chip">#${i+1}</span>`)
    .join('')
  window.parent.postMessage({ type: 'PDF_SELECTED_PAGES', payload: selectedPages.slice() }, '*')
}

function setPdfBlobUrl(bytes) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  embed.src = url
  // If you don’t have a page count, you can leave it null; validation will allow “all”
  // Optional: with pdf.js you can set pdfPageCount properly here.
  // cleanup when reloading a new PDF is fine to skip for the MVP
}

// ---- EXTRACTED from legacy FileManagement_w.js (adapted) ----
function validateRange(rangeInput) {
  // reset UI
  valErrEl.style.display = 'none'
  valOkEl.style.display  = 'none'
  customInput.classList.remove('border-red-500','border-green-500')

  if (!rangeInput) return { ok:true, pages:[] } // empty = valid when type=all

  if (pdfPageCount == null) {
    // Legacy allowed validation to pass if count was unknown.
    return { ok:true, pages:[] }
  }

  try {
    const parts = rangeInput.split(',')
    const pageNumbers = []
    for (let part of parts) {
      part = part.trim()
      if (!part) continue

      if (part.includes('-')) {
        const [a,b] = part.split('-')
        const start = parseInt((a||'').trim(),10)
        const end   = parseInt((b||'').trim(),10)
        if (isNaN(start) || isNaN(end)) throw new Error(`Invalid numbers in range: "${part}"`)
        if (start < 1 || end > pdfPageCount) throw new Error(`Range "${part}" is outside PDF bounds (1-${pdfPageCount}).`)
        if (start > end) throw new Error(`Invalid range "${part}": start page must be ≤ end page.`)
        for (let i=start;i<=end;i++) pageNumbers.push(i)
      } else {
        const num = parseInt(part,10)
        if (isNaN(num)) throw new Error(`Invalid page number: "${part}"`)
        if (num < 1 || num > pdfPageCount) throw new Error(`Page ${num} is outside PDF bounds (1-${pdfPageCount}).`)
        pageNumbers.push(num)
      }
    }
    // show OK
    customInput.classList.add('border-green-500')
    valOkEl.style.display = 'block'
    return { ok:true, pages: Array.from(new Set(pageNumbers)).sort((a,b)=>a-b) }
  } catch (err) {
    customInput.classList.add('border-red-500')
    valErrEl.textContent = `✗ ${err.message}`
    valErrEl.style.display = 'block'
    return { ok:false, pages:[] }
  }
}
// -------------------------------------------------------------

function recomputeSelection() {
  const type = selTypeEl.value // 'all' | 'custom'
  if (type === 'all') {
    // If page count known, select all; else clear (parent can still proceed)
    if (pdfPageCount != null) {
      selectedPages = Array.from({length: pdfPageCount}, (_,i)=>i)
    } else {
      selectedPages = []
    }
    renderChips()
    return
  }
  const { ok, pages } = validateRange(customInput.value)
  if (!ok) {
    selectedPages = []
    renderChips()
    return
  }
  // convert 1-based to 0-based
  selectedPages = pages.map(p => p-1)
  renderChips()
}

// --- Event wiring (matches legacy IDs/UX) ---
selTypeEl.addEventListener('change', () => {
  const isCustom = selTypeEl.value === 'custom'
  customWrap.style.display = isCustom ? '' : 'none'
  if (!isCustom) customInput.value = ''
  recomputeSelection()
})
customInput.addEventListener('input', () => { recomputeSelection() })
btnAll.addEventListener('click', () => {
  selTypeEl.value = 'all'
  customWrap.style.display = 'none'
  customInput.value = ''
  recomputeSelection()
})
btnClear.addEventListener('click', () => {
  selectedPages = []
  renderChips()
})

// --- Messaging bridge (Nuxt parent ↔ iframe) ---
window.addEventListener('message', (e) => {
  const { type, payload } = e.data || {}
  if (type === 'LOAD_PDF_ARRAYBUFFER' && payload) {
    pdfBytes = payload
    setPdfBlobUrl(payload)
    // If you have pdf.js, set pdfPageCount here
    // e.g., const doc = await PDFJS.getDocument({ data: payload }).promise; pdfPageCount = doc.numPages;
    recomputeSelection()
  }
})

// Initial UI
recomputeSelection()

