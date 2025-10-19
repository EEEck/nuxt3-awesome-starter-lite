<script setup lang="ts">
const props = defineProps<{ step: 1 | 2 | 3 }>()
</script>

<template>
  <div class="mb-6 flex items-center gap-4 text-sm font-medium text-slate-600">
    <div class="flex items-center gap-2">
      <div :class="['flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold', props.step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500']">1</div>
      <span class="text-slate-700">Profile Info</span>
    </div>
    <div class="h-px w-10 bg-slate-200"></div>
    <div class="flex items-center gap-2">
      <div :class="['flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold', props.step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500']">2</div>
      <span class="text-slate-700">Question Types</span>
    </div>
  </div>
  
</template>

