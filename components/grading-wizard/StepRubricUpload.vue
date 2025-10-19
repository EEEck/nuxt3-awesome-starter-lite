<script setup lang="ts">
import { ref } from 'vue'
import { useWizard } from '~/stores/wizard'
const wiz = useWizard()
const error = ref<string | null>(null)
const uploadedName = ref<string | null>(null)

async function onPick(e: Event) {
  error.value = null
  uploadedName.value = null
  try {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
    const json = JSON.parse(await f.text())
    if (!json?.questions || !Array.isArray(json.questions)) throw new Error('Missing "questions"[]')
    wiz.setRubric(json)
    uploadedName.value = f.name
  } catch (err:any) {
    error.value = err?.message ?? 'Invalid rubric JSON'
  }
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
      <div class="rounded-lg border border-slate-300 p-6 dark:border-slate-700">
        <div class="flex flex-col items-center gap-3 text-center">
          <p class="text-lg font-medium">Upload Rubric (JSON)</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">Drag and drop your rubric file here or click to browse</p>
          <input type="file" accept="application/json" @change="onPick" />
        </div>
      </div>

      <div v-if="uploadedName" class="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-500/40 dark:bg-green-900/20 dark:text-green-200">
        <p class="font-medium">Rubric Uploaded Successfully</p>
        <p class="text-sm">{{ uploadedName }}</p>
        <div class="mt-3">
          <button type="button" class="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700" @click="proceedToEdit">
            Next: Review & Edit
          </button>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>
  </section>
</template>
