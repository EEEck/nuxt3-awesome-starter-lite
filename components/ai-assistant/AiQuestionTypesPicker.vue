<script setup lang="ts">
import { reactive, computed } from 'vue'
import { iconMap, type IconKey } from '~/lib/ui/icons'
import type { PresetQuestionType } from '~/lib/ai-assistant/constants'

type SelectedQuestionType = PresetQuestionType & { isCustom?: boolean; instructions?: string }

const props = defineProps<{
  presets: PresetQuestionType[]
  selected: SelectedQuestionType[]
}>()

const emit = defineEmits<{
  (e: 'toggle', pt: PresetQuestionType): void
  (e: 'add-custom', payload: { name: string; instructions: string }): void
  (e: 'remove', id: string): void
}>()

const custom = reactive({ name: '', instructions: '' })
const selectedCount = computed(() => props.selected.length)

function onToggle(pt: PresetQuestionType) { emit('toggle', pt) }
function onAddCustom() {
  emit('add-custom', { name: custom.name, instructions: custom.instructions })
  custom.name = ''
  custom.instructions = ''
}
function onRemove(id: string) { emit('remove', id) }
</script>

<template>
  <div class="space-y-6">
    <div>
      <h4 class="mb-3 text-lg font-medium text-slate-900">Select Question Types You Use</h4>
      <div class="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label v-for="pt in props.presets" :key="pt.id" class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-3 hover:border-blue-400">
          <input type="checkbox" class="mt-1" :checked="props.selected.some(x => x.id === pt.id)" @change="onToggle(pt)" />
          <div>
            <div class="mb-1 flex items-center gap-2">
              <Icon :name="iconMap[pt.icon]" class="h-4 w-4 text-blue-500" aria-hidden="true" />
              <span class="font-medium text-slate-900">{{ pt.name }}</span>
            </div>
            <p class="text-sm text-slate-500">{{ pt.description }}</p>
          </div>
        </label>
      </div>
      <p class="text-xs text-slate-500">Each type has optimized AI grading instructions built-in.</p>
    </div>

    <div class="border-t border-slate-200 pt-4">
      <h4 class="mb-3 text-lg font-medium text-slate-900">Add Custom Question Types</h4>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="space-y-3">
          <input v-model="custom.name" type="text" placeholder="Type name (e.g., 'Lab Report Analysis')" class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <div class="flex flex-col gap-3 md:flex-row">
            <textarea v-model="custom.instructions" rows="3" placeholder="Grading instructions for this question type..." class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"></textarea>
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600" @click="onAddCustom">
              <Icon :name="iconMap.Plus" class="h-4 w-4" aria-hidden="true" />
              Add Custom Type
            </button>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h4 class="mb-3 text-lg font-medium text-slate-900">Your Question Types ({{ selectedCount }})</h4>
      <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div v-if="props.selected.length === 0" class="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-slate-500">
          <Icon :name="iconMap.HelpCircle" class="h-6 w-6 text-slate-400" aria-hidden="true" />
          <p>No question types selected yet</p>
          <p class="text-xs">Select types from above to see them here</p>
        </div>
        <div v-else v-for="type in props.selected" :key="type.id" class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Icon :name="iconMap[type.icon]" class="h-5 w-5 text-blue-500" aria-hidden="true" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-900">{{ type.name }}</span>
                <span v-if="type.isCustom" class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">Custom</span>
              </div>
              <p class="text-xs text-slate-500">{{ type.isCustom ? type.instructions : type.description }}</p>
            </div>
          </div>
          <button type="button" class="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="onRemove(type.id)">
            <Icon :name="iconMap.Trash2" class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">Remove {{ type.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

