<script setup lang="ts">
import type { ExamRubric } from '~/stores/wizard'
const props = defineProps<{ value: ExamRubric }>()
const emit = defineEmits<{ (e:'update:value', v: ExamRubric): void }>()

function setName(k:'exam_name'|'rubric_name', v:string){ emit('update:value', { ...props.value, [k]: v }) }
function bumpMax(i:number, delta:number){
  const r = structuredClone(props.value); const q=r.questions[i]
  q.max_points = Math.max(0, q.max_points + delta); emit('update:value', r)
}
function addCrit(i:number){
  const r = structuredClone(props.value); r.questions[i].criteria ??= []
  r.questions[i].criteria!.push({ criterion:'New criterion', max_points:1 }); emit('update:value', r)
}
function rmCrit(i:number, j:number){ const r=structuredClone(props.value); r.questions[i].criteria?.splice(j,1); emit('update:value', r) }
function editCrit(i:number, j:number, f:'criterion'|'max_points', v:any){
  const r = structuredClone(props.value); // @ts-ignore
  r.questions[i].criteria![j][f] = f === 'max_points' ? Number(v) : String(v); emit('update:value', r)
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <label class="block">
        <span class="text-sm text-gray-700">Exam name</span>
        <input class="mt-1 w-full rounded border p-2" :value="value.exam_name ?? ''"
               @input="setName('exam_name', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="block">
        <span class="text-sm text-gray-700">Rubric name</span>
        <input class="mt-1 w-full rounded border p-2" :value="value.rubric_name ?? ''"
               @input="setName('rubric_name', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>

    <div v-for="(q, i) in value.questions" :key="q.question_id" class="rounded border p-4">
      <div class="flex items-center justify-between">
        <div class="font-medium">{{ q.question_text }}</div>
        <div class="flex items-center gap-2">
          <button class="btn" @click="bumpMax(i,-1)">−</button>
          <span class="text-sm">Max: {{ q.max_points }}</span>
          <button class="btn" @click="bumpMax(i,+1)">＋</button>
        </div>
      </div>

      <div class="mt-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">Criteria</h3>
          <button class="btn" @click="addCrit(i)">Add criterion</button>
        </div>
        <div v-if="q.criteria?.length" class="mt-2 space-y-2">
          <div v-for="(c, j) in q.criteria" :key="j" class="grid grid-cols-12 items-center gap-2">
            <input class="col-span-8 rounded border p-2" :value="c.criterion"
                   @input="editCrit(i, j, 'criterion', ($event.target as HTMLInputElement).value)" />
            <input class="col-span-3 rounded border p-2" type="number" min="0" :value="c.max_points"
                   @input="editCrit(i, j, 'max_points', ($event.target as HTMLInputElement).value)" />
            <button class="col-span-1 btn" @click="rmCrit(i, j)">✕</button>
          </div>
        </div>
        <div v-else class="text-xs text-gray-500 mt-1">No criteria yet.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn { @apply rounded border px-3 py-1 text-sm hover:bg-gray-50; }
</style>
