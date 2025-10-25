<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

type PageImage = { image_base64: string; page_number?: number }

const props = defineProps<{
  pdfUrl?: string | null
  imageUrl?: string | null
  pageImages?: PageImage[] | null
  initialPage?: number
  activeId?: string | null
}>()

const hasPdf = computed(() => Boolean(props.pdfUrl) && !(props.pageImages && props.pageImages.length))
const hasImage = computed(() => Boolean(props.imageUrl) && !(props.pageImages && props.pageImages.length))
const hasPages = computed(() => Array.isArray(props.pageImages) && props.pageImages!.length > 0)

const scale = ref(1)
const container = ref<HTMLDivElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)
const currentPageIndex = ref(Math.max(0, (props.initialPage ?? 1) - 1))

function zoomIn() { scale.value = Math.min(3, +(scale.value + 0.1).toFixed(2)) }
function zoomOut() { scale.value = Math.max(0.25, +(scale.value - 0.1).toFixed(2)) }
function resetZoom() { scale.value = 1 }

function setScaleToFitWidth() {
  if (!container.value || !imgEl.value) return
  const cw = container.value.clientWidth - 8
  const iw = imgEl.value.naturalWidth || imgEl.value.width
  if (iw > 0) scale.value = +(cw / iw).toFixed(2)
}
function setScaleToFitHeight() {
  if (!container.value || !imgEl.value) return
  const ch = container.value.clientHeight - 8
  const ih = imgEl.value.naturalHeight || imgEl.value.height
  if (ih > 0) scale.value = +(ch / ih).toFixed(2)
}

// Drag to pan
let dragging = false
let startX = 0, startY = 0, scrollLeft = 0, scrollTop = 0
function onMouseDown(e: MouseEvent) {
  if (!container.value) return
  dragging = true
  container.value.classList.add('dragging')
  startX = e.clientX
  startY = e.clientY
  scrollLeft = container.value.scrollLeft
  scrollTop = container.value.scrollTop
}
function onMouseUp() {
  dragging = false
  container.value?.classList.remove('dragging')
}
function onMouseMove(e: MouseEvent) {
  if (!dragging || !container.value) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  container.value.scrollLeft = scrollLeft - dx
  container.value.scrollTop = scrollTop - dy
}

onMounted(() => {
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousemove', onMouseMove)
})
onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousemove', onMouseMove)
})

watch(() => props.imageUrl, () => resetZoom())
watch(() => props.pageImages, async () => {
  currentPageIndex.value = 0
  await nextTick(); resetZoom()
})

const pageCount = computed(() => (props.pageImages?.length ?? 0))
const currentPage = computed(() => props.pageImages?.[currentPageIndex.value] ?? null)
function prevPage() { if (currentPageIndex.value > 0) currentPageIndex.value-- }
function nextPage() { if (currentPageIndex.value < pageCount.value - 1) currentPageIndex.value++ }
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-slate-900 dark:text-white">Original Document</h4>
      <div class="flex items-center gap-1">
        <button class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" title="Fit width" @click="setScaleToFitWidth"><Icon name="lucide:stretch-horizontal" /></button>
        <button class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" title="Fit height" @click="setScaleToFitHeight"><Icon name="lucide:stretch-vertical" /></button>
        <button class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" title="Zoom out" @click="zoomOut"><Icon name="lucide:zoom-out" /></button>
        <button class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" title="Zoom in" @click="zoomIn"><Icon name="lucide:zoom-in" /></button>
        <button class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" title="Reset" @click="resetZoom"><Icon name="lucide:reset" /></button>
      </div>
    </div>
    <div ref="container" class="viewer rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950" :class="props.activeId ? 'ring-1 ring-brand-400/40' : ''" @mousedown="onMouseDown">
      <!-- Multi-page processed images -->
      <div v-if="hasPages" class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-600">
          <div>Processed page {{ (currentPageIndex+1) }} / {{ pageCount }}</div>
          <div class="flex items-center gap-1">
            <button class="rounded border px-2 py-0.5" :disabled="currentPageIndex===0" @click="prevPage"><Icon name="lucide:chevron-left" /></button>
            <button class="rounded border px-2 py-0.5" :disabled="currentPageIndex===pageCount-1" @click="nextPage"><Icon name="lucide:chevron-right" /></button>
          </div>
        </div>
        <div class="flex h-[60vh] items-center justify-center overflow-auto">
          <img ref="imgEl" :src="`data:image/jpeg;base64,${currentPage?.image_base64}`" alt="Processed page" class="max-h-full max-w-full origin-top-left" :style="{ transform: `scale(${scale})` }" />
        </div>
      </div>
      
      <!-- PDF direct view -->
      <div v-else-if="hasPdf" class="h-[60vh] overflow-hidden rounded">
        <iframe :src="props.pdfUrl || ''" class="h-full w-full bg-white" />
      </div>

      <!-- Single image view -->
      <div v-else-if="hasImage" class="flex h-[60vh] items-center justify-center overflow-auto">
        <img ref="imgEl" :src="props.imageUrl || ''" alt="Uploaded document" class="max-h-full max-w-full origin-top-left" :style="{ transform: `scale(${scale})` }" />
      </div>
      <div v-else class="h-[60vh] text-center text-slate-500">No preview available</div>
    </div>
  </div>
</template>

<style scoped>
.viewer { box-shadow: inset 0 1px 0 rgba(255,255,255,.06); }
.viewer.dragging { cursor: grabbing; }
</style>
