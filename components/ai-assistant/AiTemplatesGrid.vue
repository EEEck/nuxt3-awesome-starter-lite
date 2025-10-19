<script setup lang="ts">
import { iconMap } from '~/lib/ui/icons'
import { templates as defaultTemplates } from '~/lib/ai-assistant/constants'

const props = withDefaults(defineProps<{
  templates?: typeof defaultTemplates
}>(), {
  templates: () => defaultTemplates,
})

const emit = defineEmits<{ (e: 'select', t: typeof defaultTemplates[number]): void }>()

function onClick(t: typeof defaultTemplates[number]) { emit('select', t) }
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center gap-2 text-slate-900">
      <Icon :name="iconMap.Zap" class="h-5 w-5 text-amber-500" aria-hidden="true" />
      <h2 class="text-lg font-semibold">Quick Start</h2>
    </div>
    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <button v-for="t in props.templates" :key="t.id" type="button" class="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400" @click="onClick(t)">
        <div class="flex flex-col items-center text-center">
          <div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full" :class="t.iconBgClass">
            <Icon :name="iconMap[t.icon]" class="h-6 w-6" :class="t.iconColorClass" aria-hidden="true" />
          </div>
          <div class="font-medium text-slate-900">{{ t.name }}</div>
          <div class="text-xs text-slate-500">{{ t.description }}</div>
        </div>
      </button>
    </div>
  </section>
</template>

