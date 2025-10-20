<script setup lang="ts">
import { useScanStore } from '~/stores/scan'

const scan = useScanStore()

function startUpload() {
  scan.go('upload')
}

function openPicker() {
  scan.openPicker()
}
</script>

<template>
  <div class="space-y-8">
    <header class="text-center space-y-2">
      <h1 class="text-2xl font-semibold">Document Processing Pipeline</h1>
      <p class="text-slate-500">Initialize AI-powered document analysis and grading workflow</p>
    </header>

    <section class="space-y-6">
      <!-- Primary Band: Start New Grading -->
      <div class="rounded-2xl border border-blue-400/40 bg-blue-500/10 p-8 text-center">
        <div class="flex items-center justify-center gap-4 mb-3">
          <Icon name="lucide:eye" class="h-6 w-6 text-blue-400" />
          <Icon name="lucide:zap" class="h-6 w-6 text-green-400" />
          <Icon name="lucide:cpu" class="h-6 w-6 text-yellow-400" />
        </div>
        <h2 class="text-xl font-semibold">Start New Grading</h2>
        <p class="text-slate-500">Upload student worksheets and rubrics for AI-powered analysis</p>
        <button class="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-subtle hover:bg-blue-500"
                id="start-btn" @click="startUpload">
          <Icon name="lucide:upload" />
          Upload Documents
        </button>
      </div>

      <!-- Divider -->
      <div class="text-center">
        <span class="inline-block rounded-full border border-slate-300/40 bg-slate-700/10 px-4 py-1 text-slate-400">or</span>
      </div>

      <!-- Secondary Band: Resume Session -->
      <div class="cursor-pointer rounded-xl border border-slate-600/30 bg-slate-700/30 p-6 transition hover:bg-slate-700/40"
           id="resume-session-band" @click="openPicker">
        <div class="flex items-center gap-4">
          <span class="text-xl">📄</span>
          <div class="text-left">
            <h3 class="m-0 text-base font-medium text-slate-200">Load Existing Session</h3>
            <p class="m-0 text-sm text-slate-400">Access previously processed documents</p>
          </div>
          <button class="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-500 px-4 py-1.5 text-sm hover:bg-slate-800"
                  id="continue-btn">
            Load Session
          </button>
        </div>
      </div>
    </section>

    <ScanDocumentPicker v-if="scan.pickerOpen" @close="scan.closePicker" />
  </div>
</template>

<style scoped>
.shadow-subtle { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
</style>

