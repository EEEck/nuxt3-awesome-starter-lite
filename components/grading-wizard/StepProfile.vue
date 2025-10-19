<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useWizardStore } from '~/stores/wizard'
import { useProfilesStore } from '~/stores/profiles'

const wizard = useWizardStore()
const profiles = useProfilesStore()

const localProfile = ref(wizard.profileId)

watch(localProfile, (value) => {
  wizard.setProfile(value)
})

const hasProfiles = computed(() => profiles.profiles.length > 0)

const goNext = () => {
  wizard.next()
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
      <h2 class="text-2xl font-semibold">Select Teacher Profile</h2>
      <p class="text-slate-600 dark:text-slate-300">
        Choose your teaching profile to customize AI grading behavior.
      </p>
    </header>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Profile ID</label>
        <input
          v-model="localProfile"
          type="text"
          placeholder="eg. spring-2025-bio101"
          class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700"
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Or pick an existing profile</label>
        <div class="rounded border border-slate-300 p-2 dark:border-slate-700">
          <div v-if="!hasProfiles" class="text-sm text-slate-500 dark:text-slate-400">No saved profiles yet.</div>
          <ul v-else class="max-h-44 space-y-1 overflow-y-auto">
            <li v-for="p in profiles.profiles" :key="p.id" class="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">
              <div>
                <p class="text-sm font-medium">{{ p.name }}</p>
                <p class="text-xs text-slate-500">{{ p.id }}</p>
              </div>
              <button type="button" class="text-xs text-brand-600 hover:underline" @click="localProfile = p.id">Select</button>
            </li>
          </ul>
        </div>
        <NuxtLink
          to="/ai-assistant"
          class="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
        >
          Create profile in AI Assistant
        </NuxtLink>
      </div>
    </div>
    <button
      type="button"
      class="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      :disabled="!wizard.profileId"
      @click="goNext"
    >
      Next
    </button>

    <div class="mt-6">
      <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-900/20">
        <h4 class="text-blue-800 font-medium dark:text-blue-300 mb-1">
          Next: Rubric Setup
        </h4>
        <p class="text-sm text-blue-700 dark:text-blue-200">
          Upload or create your exam rubric with scoring criteria.
        </p>
      </div>
    </div>
  </section>
</template>
