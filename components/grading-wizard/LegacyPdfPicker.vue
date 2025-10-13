<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useWizard } from '~/stores/wizard'

const wiz = useWizard()
const iframeRef = ref<HTMLIFrameElement|null>(null)

function loadPdfIntoIframe(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    iframeRef.value?.contentWindow?.postMessage(
      { type: 'LOAD_PDF_ARRAYBUFFER', payload: reader.result },
      '*'
    )
  }
  reader.readAsArrayBuffer(file)
}

function onMessage(e: MessageEvent) {
  const { type, payload } = e.data || {}
  if (type === 'PDF_SELECTED_PAGES' && Array.isArray(payload)) {
    wiz.setSelectedPages(payload)
  }
}

onMounted(() => window.addEventListener('message', onMessage))
onUnmounted(() => window.removeEventListener('message', onMessage))

watch(() => wiz.pdfFile, (f) => { if (f) loadPdfIntoIframe(f) }, { immediate: true })
</script>

<template>
  <div class="border rounded overflow-hidden">
    <!-- Serve your legacy viewer here -->
    <iframe ref="iframeRef"
            src="/legacy/pdfviewer/index.html"
            class="w-full h-[70vh]"
            title="Legacy PDF Viewer"></iframe>
  </div>
</template>
