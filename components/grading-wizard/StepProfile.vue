<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWizardStore } from '~/stores/wizard'

const wizard = useWizardStore()
const localProfile = ref(wizard.profileId)

watch(localProfile, (value) => {
  wizard.setProfile(value)
})

const goNext = () => {
  wizard.next()
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
      <h2 class="text-2xl font-semibold">Select a grading profile</h2>
      <p class="text-slate-600 dark:text-slate-300">
        Profiles capture the course, term, and grading configuration. Choose an existing profile ID to continue.
      </p>
    </header>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Profile ID</label>
      <input
        v-model="localProfile"
        type="text"
        placeholder="eg. spring-2024-math101"
        class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700"
      />
    </div>
    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      :disabled="!wizard.profileId"
      @click="goNext"
    >
      Next
    </button>
  </section>
</template>
