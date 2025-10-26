<script setup lang="ts">
/**
 * ReviewActions
 * Small action cluster used on cards to approve, flag for review, and remove.
 * Emits update events instead of mutating state directly.
 */
const props = withDefaults(defineProps<{
  flagged?: boolean
  accepted?: boolean
  showApprove?: boolean
  showFlag?: boolean
  showRemove?: boolean
}>(), {
  flagged: false,
  accepted: false,
  showApprove: true,
  showFlag: true,
  showRemove: false,
})

const emit = defineEmits<{
  'update:flagged': [value: boolean]
  'update:accepted': [value: boolean]
  remove: []
}>()

function onApprove(e?: Event) { e?.stopPropagation?.(); emit('update:accepted', !props.accepted) }
function onFlag(e?: Event) { e?.stopPropagation?.(); emit('update:flagged', !props.flagged) }
function onRemove(e?: Event) { e?.stopPropagation?.(); emit('remove') }
</script>

<template>
  <div class="flex items-center gap-2">
    <button v-if="showApprove" class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
            :class="accepted ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-300 text-slate-300 dark:border-slate-700'"
            @click="onApprove">
      <Icon :name="accepted ? 'lucide:check-circle' : 'lucide:check'" class="h-3 w-3" />
      {{ accepted ? 'Approved' : 'Approve' }}
    </button>
    <button v-if="showFlag" class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
            :class="flagged ? 'border-red-500 bg-red-500/10 text-red-300' : 'border-slate-300 text-slate-300 dark:border-slate-700'"
            @click="onFlag">
      <Icon name="lucide:flag" class="h-3 w-3" />
      {{ flagged ? 'Flagged' : 'Flag for Review' }}
    </button>
    <button v-if="showRemove" class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="onRemove">
      <Icon name="lucide:trash-2" class="h-3 w-3" /> Remove
    </button>
  </div>
</template>

<style scoped>
</style>
