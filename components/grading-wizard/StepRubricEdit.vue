<script setup lang="ts">
import { useWizard } from '~/stores/wizard'
import RubricEditor from './RubricEditor.vue'
const wiz = useWizard()
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
      <h2 class="text-2xl font-semibold">Review & Edit Rubric</h2>
      <p class="text-slate-600 dark:text-slate-300">Review and fine-tune your rubric.</p>
    </header>

    <RubricEditor
      v-if="wiz.rubric"
      :value="wiz.rubric"
      @update:value="wiz.replaceRubric($event)"
    />
    <div v-else class="text-sm text-gray-600 dark:text-gray-300">
      No rubric loaded. Go back to upload.
    </div>

    <div class="flex justify-end">
      <button class="rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" @click="wiz.go('answers-upload')">
        Continue
      </button>
    </div>
  </section>
</template>
