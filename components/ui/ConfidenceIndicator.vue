<script setup lang="ts">
const props = defineProps<{
  confidence?: number | null
  justification?: string | null
  needsReview?: boolean | null
  uploadType?: 'student' | 'rubric' | null
  nameConfidence?: number | null
  studentName?: string | null
}>()

const levelColor = (v: number) => v >= 0.8 ? 'text-green-400' : v >= 0.6 ? 'text-yellow-400' : 'text-red-400'
const levelIcon = (v: number) => v >= 0.8 ? 'lucide:check-circle' : v >= 0.6 ? 'lucide:alert-triangle' : 'lucide:x-circle'
const bg = (v: number) => v >= 0.8 ? 'bg-green-500/20 border-green-400/30' : v >= 0.6 ? 'bg-yellow-500/20 border-yellow-400/30' : 'bg-red-500/20 border-red-400/30'
</script>

<template>
  <div v-if="typeof props.confidence === 'number'" class="mt-2 rounded-lg border p-3" :class="bg(props.confidence)">
    <div class="mb-1 flex items-center gap-2 text-white">
      <Icon :name="levelIcon(props.confidence)" class="h-4 w-4" />
      <span class="text-sm font-medium">Extraction Confidence: <span :class="levelColor(props.confidence)">{{ Math.round(props.confidence * 100) }}%</span></span>
      <span v-if="props.needsReview" class="ml-2 text-xs text-red-300">Needs review</span>
    </div>
    <p v-if="props.justification" class="text-xs text-gray-300">{{ props.justification }}</p>
    <div v-if="props.uploadType === 'student' && typeof props.nameConfidence === 'number'" class="mt-2 text-xs text-gray-300">
      Student: <span class="text-white font-medium">{{ props.studentName || 'Unknown' }}</span>
      <span class="ml-3">Name Confidence: <span :class="levelColor(props.nameConfidence)">{{ Math.round(props.nameConfidence * 100) }}%</span></span>
    </div>
  </div>
</template>

<style scoped>
</style>

