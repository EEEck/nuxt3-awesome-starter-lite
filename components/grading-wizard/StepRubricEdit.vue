<script setup lang="ts">
import { useWizard } from '~/stores/wizard'
import RubricEditor from './RubricEditor.vue'
const wiz = useWizard()
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Rubric Edit</h2>

    <RubricEditor
      v-if="wiz.rubric"
      :value="wiz.rubric"
      @update:value="wiz.replaceRubric($event)"
    />
    <div v-else class="text-sm text-gray-600">
      No rubric loaded. Go back to upload.
    </div>

    <div class="flex justify-end">
      <button class="btn" @click="wiz.go('grade')">Continue to Grading</button>
    </div>
  </div>
</template>
