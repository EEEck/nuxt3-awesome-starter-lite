<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useScanStore } from '~/stores/scan'

const scan = useScanStore()
const fileInput = ref<HTMLInputElement | null>(null)

const isPdf = computed(() => {
  const f = scan.file
  if (!f) return false
  const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
  return ext === '.pdf'
})

const canNext = computed(() => scan.canProceedUpload)
const hasFile = computed(() => Boolean(scan.file))

// Local modal for PDF preview
const showPreview = ref(false)
function openPdfPreview() {
  if (!isPdf.value) return
  showPreview.value = true
}
function closePdfPreview() { showPreview.value = false }

function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] || null
  scan.setFile(f || null)
  if (f) {
    const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
    if (ext === '.pdf') scan.detectPdfPageCount()
  }
}

function browseFiles() {
  fileInput.value?.click()
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    scan.setFile(f)
    const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
    if (ext === '.pdf') scan.detectPdfPageCount()
  }
}
function onDragOver(e: DragEvent) { e.preventDefault() }

// Validate range reactively
watch(() => scan.pageSelection.custom, (v) => {
  if (scan.pageSelection.type === 'custom') scan.validatePageRange(v || '')
})

// Revalidate when page count arrives
watch(() => scan.pdfPageCount, (count) => {
  if (scan.pageSelection.type === 'custom' && (scan.pageSelection.custom || '').trim()) {
    scan.validatePageRange(scan.pageSelection.custom || '')
  }
})

function startProcessing() { scan.processDocument() }
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Upload</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Select document type, add a file, and optional PDF page range.</p>
    </div>

    <!-- Upload type + dropzone -->
    <div class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <!-- Left: Type + File -->
      <div class="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <div class="grid grid-cols-2 gap-3">
          <button type="button"
                  class="rounded-xl border px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  :class="scan.uploadType === 'student' ? 'border-blue-400/60 bg-blue-500/5' : 'border-slate-300/60 dark:border-slate-700/60'"
                  @click="scan.setUploadType('student')">
            <div class="flex items-center gap-2">
              <Icon name="lucide:scan-line" class="h-5 w-5 text-blue-500" />
              <div class="font-medium">Student Worksheet</div>
            </div>
            <p class="mt-1 text-xs text-slate-500">Scanned student answers to extract responses</p>
          </button>

          <button type="button"
                  class="rounded-xl border px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  :class="scan.uploadType === 'rubric' ? 'border-emerald-400/60 bg-emerald-500/5' : 'border-slate-300/60 dark:border-slate-700/60'"
                  @click="scan.setUploadType('rubric')">
            <div class="flex items-center gap-2">
              <Icon name="lucide:list-checks" class="h-5 w-5 text-emerald-500" />
              <div class="font-medium">Rubric / Answer Key</div>
            </div>
            <p class="mt-1 text-xs text-slate-500">Teacher rubric with correct answers and scoring</p>
          </button>
        </div>

        <div class="rounded-xl border border-slate-300/60 p-4 text-center dark:border-slate-700/60"
             :class="scan.uploadType ? 'bg-white/60 dark:bg-slate-900/60' : 'opacity-50 pointer-events-none'"
             @drop="onDrop" @dragover="onDragOver" @click.self="browseFiles">
          <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="onFilePicked" />
          <div class="space-y-2">
            <Icon name="lucide:upload" class="mx-auto h-8 w-8 text-slate-400" />
            <p class="text-sm text-slate-600 dark:text-slate-300">Drop your {{ scan.uploadType || 'document' }} here or click to browse</p>
            <button class="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-500"
                    type="button" @click.stop="browseFiles">
              Browse Files
            </button>
          </div>

          <div v-if="hasFile" class="mt-4 rounded-lg border border-slate-200/80 p-3 text-left dark:border-slate-700/60">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ scan.file?.name }}</p>
                <p class="text-xs text-slate-500">{{ (scan.file && (scan.file.size/1024/1024).toFixed(2) + ' MB') || '' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button v-if="isPdf" type="button" class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="openPdfPreview">
                  Preview PDF
                </button>
                <button type="button" class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="scan.removeFile">
                  Remove
                </button>
              </div>
            </div>

            <!-- PDF page selector -->
            <div v-if="isPdf" class="mt-3 grid gap-2 md:grid-cols-2">
              <label class="block text-sm">
                <span class="text-slate-600 dark:text-slate-300">Pages to process</span>
                <select class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                        :value="scan.pageSelection.type"
                        @change="(e:any)=>{ const val=(e.target as HTMLSelectElement).value as any; scan.setPageSelection(val); if(val==='custom'){ scan.validatePageRange(scan.pageSelection.custom||'') } }">
                  <option value="all">All pages</option>
                  <option value="custom">Custom range</option>
                </select>
                <div v-if="scan.pdfPageCount" class="mt-1 text-xs text-slate-500">Detected: {{ scan.pdfPageCount }} pages</div>
              </label>

              <label v-if="scan.pageSelection.type === 'custom'" class="block text-sm">
                <span class="text-slate-600 dark:text-slate-300">Page range</span>
                <input class="mt-1 w-full rounded-lg border p-2 text-sm"
                       :class="scan.pageRangeValid ? 'border-slate-300 dark:border-slate-700' : 'border-red-500'"
                       placeholder="e.g., 1-3, 5, 7-9"
                       :value="scan.pageSelection.custom || ''"
                       @input="scan.setCustomPages(($event.target as HTMLInputElement).value)" />
                <div class="mt-1 text-xs" :class="scan.pageRangeValid ? 'text-emerald-500' : 'text-red-500'">
                  {{ scan.pageRangeMessage }}
                </div>
                <div v-if="scan.pageRangeValid && scan.pageSelection.custom" class="mt-1 text-xs text-slate-500">
                  Selected pages: {{ scan.pageSelection.custom }}
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-2 flex items-center justify-end gap-2">
          <button type="button"
                  class="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 disabled:opacity-50"
                  :disabled="!canNext"
                  @click="startProcessing">
            Next
          </button>
        </div>
      </div>

      <!-- Right: Instructions + Debug prompt -->
      <div class="space-y-4">
        <div class="rounded-3xl border outline-variant-border bg-gradient-to-b from-surface-variant to-white p-0 shadow-sm dark:from-slate-900/60 dark:to-slate-900">
          <div class="h-1.5 rounded-t-3xl primary-bg" />
          <div class="p-5">
            <h4 class="text-base font-semibold text-slate-900 dark:text-white">Custom Processing Instructions (Optional)</h4>
            <p class="mb-2 text-sm text-slate-600 dark:text-slate-300">Add hints to improve extraction accuracy.</p>
            <textarea rows="4" class="w-full rounded-lg border outline-variant-border bg-white p-2 text-slate-900 dark:bg-slate-900 dark:text-slate-200"
                      :value="scan.customInstructions"
                      @input="scan.setCustomInstructions(($event.target as HTMLTextAreaElement).value)"
                      placeholder="e.g., Look for chemistry formulas; student wrote in cursive" />
          </div>
        </div>

        <details class="rounded-2xl border outline-variant-border bg-white p-4 text-sm dark:bg-slate-900">
          <summary class="cursor-pointer select-none text-slate-600 dark:text-slate-300">Debug: View Default AI Prompt</summary>
          <pre class="mt-2 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">{{ scan.debugPrompt }}</pre>
        </details>
      </div>
    </div>

    <!-- PDF Preview Modal -->
    <div v-if="showPreview && scan.pdfPreviewUrl" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div class="max-h-[80vh] w-full max-w-3xl rounded-2xl border border-slate-600/40 bg-slate-900 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">PDF Preview</h3>
          <button class="rounded p-1 text-white hover:bg-slate-800" @click="closePdfPreview" aria-label="Close">
            <Icon name="lucide:x" />
          </button>
        </div>
        <div class="h-[65vh] overflow-hidden rounded-lg border border-slate-700">
          <iframe :src="scan.pdfPreviewUrl || ''" class="h-full w-full bg-white" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-subtle { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
.outline-variant-border { @apply border-slate-200 dark:border-slate-700/60; }
.surface-variant { @apply bg-slate-50; }
.primary-bg { @apply bg-brand-500; }
</style>
