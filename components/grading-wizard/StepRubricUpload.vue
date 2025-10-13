<script setup lang="ts">
import { useWizard } from '~/stores/wizard'
const wiz = useWizard()
const error = ref<string | null>(null)

async function onPick(e: Event) {
  error.value = null
  try {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
    const json = JSON.parse(await f.text())
    if (!json?.questions || !Array.isArray(json.questions)) throw new Error('Missing "questions"[]')
    wiz.setRubric(json)
    wiz.go('rubric-edit')
  } catch (err:any) {
    error.value = err?.message ?? 'Invalid rubric JSON'
  }
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Rubric Upload</h2>
    <input type="file" accept="application/json" @change="onPick" />
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
