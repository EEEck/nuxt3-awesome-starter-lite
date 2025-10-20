<script setup lang="ts">
import { ref } from 'vue'
import { useDropZone } from '@vueuse/core'
import { useWizard } from '~/stores/wizard'
const wiz = useWizard()
const error = ref<string | null>(null)
const uploadedName = ref<string | null>(null)
const dragOver = ref(false)

async function handleFile(file: File) {
  try {
    const json = JSON.parse(await file.text())
    if (!json?.questions || !Array.isArray(json.questions)) throw new Error('Missing "questions"[]')
    wiz.setRubric(json)
    try { wiz.saveSession({ data: json, title: json?.exam_name || file.name }) } catch {}
    uploadedName.value = file.name
    // Auto-advance
    wiz.go('rubric-edit')
  } catch (err: any) {
    error.value = err?.message ?? 'Invalid rubric JSON'
  }
}

async function onPick(e: Event) {
  error.value = null
  uploadedName.value = null
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  await handleFile(f)
}

function proceedToEdit() {
  if (wiz.rubric) wiz.go('rubric-edit')
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
      <h2 class="text-2xl font-semibold">Upload Rubric</h2>
      <p class="text-slate-600 dark:text-slate-300">Upload your grading rubric file (JSON)</p>
    </header>

    <div class="space-y-4">
      <div
        ref="dropEl"
        class="group rounded-2xl border-2 border-dashed p-8 text-center transition"
        :class="[
          dragOver ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 bg-white',
          'hover:border-brand-400 hover:shadow-subtle'
        ]"
      >
        <div class="flex flex-col items-center gap-3">
          <Icon name="lucide:upload" class="h-8 w-8 text-brand-500" />
          <p class="text-lg font-medium text-slate-900 dark:text-white">Upload Rubric (JSON)</p>
          <p class="text-sm text-slate-600 dark:text-slate-400">Drag and drop your rubric file here or click to browse</p>
          <label class="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <input type="file" accept="application/json" class="hidden" @change="onPick" />
            Browse files
          </label>
        </div>
      </div>

      <div v-if="uploadedName" class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-500/40 dark:bg-green-900/20 dark:text-green-200">
        <p class="font-medium">Rubric Uploaded Successfully</p>
        <p class="text-sm">{{ uploadedName }}</p>
        <div class="mt-3">
          <button type="button" class="rounded bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500" @click="proceedToEdit">
            Next: Review & Edit
          </button>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  setup() {
    const dropEl = ref<HTMLElement | null>(null)
    const dragOver = ref(false)
    useDropZone(dropEl, {
      onDrop(files) {
        if (files?.length) handleFile(files[0])
      },
      onOver() { dragOver.value = true },
      onLeave() { dragOver.value = false }
    })
    return { dropEl, dragOver }
  }
}
</script>
