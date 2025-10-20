<script setup lang="ts">
import { computed } from 'vue'
import { useScanStore } from '~/stores/scan'

const emit = defineEmits<{ close: [] }>()
const scan = useScanStore()

const hasDocs = computed(() => scan.docs.length > 0)

function onClose() { emit('close') }
function selectDoc(id: string) { scan.loadDocument(id) }
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
    <div class="w-full max-w-lg rounded-2xl border border-slate-600/40 bg-slate-900 p-4">
      <header class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Load Previous Document</h3>
        <button class="rounded p-1 hover:bg-slate-800" @click="onClose" aria-label="Close">
          <Icon name="lucide:x" />
        </button>
      </header>

      <div class="min-h-[220px]">
        <div v-if="scan.docsLoading" class="py-8 text-center text-slate-300">
          <Icon name="lucide:loader" class="mx-auto mb-2 h-6 w-6 animate-spin" />
          <p>Loading saved documents...</p>
        </div>

        <div v-else>
          <div v-if="scan.docsError" class="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {{ scan.docsError }}
          </div>

          <div v-if="hasDocs" class="space-y-2">
            <button v-for="doc in scan.docs" :key="doc.document_id"
                    class="w-full rounded-lg border border-slate-700/60 p-3 text-left hover:bg-slate-800"
                    @click="selectDoc(doc.document_id)">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ doc.upload_type === 'student' ? '🧑‍🎓' : '🧾' }}</span>
                  <div>
                    <p class="font-medium text-white">{{ doc.original_filename.length > 30 ? doc.original_filename.slice(0, 30) + '…' : doc.original_filename }}</p>
                    <p class="text-xs text-slate-400">{{ doc.upload_type === 'student' ? 'Student' : 'Rubric' }}</p>
                  </div>
                </div>
                <div class="text-right text-xs text-slate-400">
                  <p>Modified:</p>
                  <p>{{ new Date(doc.updated_at).toLocaleString() }}</p>
                </div>
              </div>
            </button>
          </div>

          <div v-else class="py-10 text-center text-slate-400">
            <Icon name="lucide:folder-x" class="mx-auto mb-2 h-10 w-10 opacity-60" />
            <p>No saved documents found.</p>
            <p class="text-xs">Process a document first to see it here.</p>
          </div>
        </div>
      </div>

      <footer class="mt-4 flex justify-end">
        <button class="rounded border border-slate-600 px-4 py-1.5 text-sm hover:bg-slate-800" @click="onClose">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
</style>

