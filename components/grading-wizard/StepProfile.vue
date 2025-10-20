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
const selected = computed(() => (localProfile.value ? profiles.byId(localProfile.value) : null))
const questionTypesCount = computed(() => selected.value?.questionTypes?.length ?? 0)

function onSelectChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  localProfile.value = val || null
}

function createProfile() {
  window.location.href = '/ai-assistant'
}

function goNext() {
  wizard.next()
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h2 class="text-2xl font-semibold">Select Teacher Profile</h2>
      <p class="text-slate-400">Choose your teaching profile to customize AI grading behavior</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="mb-4 flex items-center gap-2 text-white">
        <Icon name="lucide:user-check" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Grading Profile</h3>
      </div>

      <div class="mb-4 text-sm text-slate-600 dark:text-slate-400">
        <Icon name="lucide:info" class="mr-1 inline h-4 w-4" />
        Select a profile to enable smart question type detection and personalized grading
      </div>

      <div class="flex items-end gap-4">
        <div class="flex-1">
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Profile (Optional)</label>
          <select
            id="profileSelect"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            :value="localProfile || ''"
            @change="onSelectChange"
          >
            <option value="">No profile selected - use default grading</option>
            <option v-for="p in profiles.profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <button class="btn btn-primary rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-500" id="createProfileBtn" @click="createProfile">
          <Icon name="lucide:plus" class="mr-1 inline h-4 w-4" /> Create Profile
        </button>
      </div>

      <div v-if="selected" id="selectedProfileInfo" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 id="profileInfoName" class="mb-1 font-medium text-slate-900 dark:text-white">{{ selected!.name }}</h4>
            <p id="profileInfoDetails" class="mb-2 text-sm text-slate-600 dark:text-slate-400">
              {{ [selected!.subjectArea, selected!.gradeLevel, selected!.schoolType].filter(Boolean).join(' • ') || 'General' }}
            </p>
            <p id="profileInfoInstructions" class="text-xs text-slate-500 dark:text-slate-400">{{ selected!.generalInstructions || 'No special instructions' }}</p>
          </div>
          <div class="text-right">
            <div class="mb-1 text-xs text-slate-500 dark:text-slate-400">Question Types</div>
            <div id="profileInfoTypes" class="text-sm font-medium text-slate-700 dark:text-blue-300">{{ questionTypesCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-900/20">
      <h4 class="mb-1 font-medium text-blue-700 dark:text-blue-300"><Icon name="lucide:arrow-right" class="mr-1 inline h-4 w-4" /> Next: Rubric Setup</h4>
      <p class="text-sm text-blue-700/80 dark:text-blue-200">Upload or create your exam rubric with scoring criteria</p>
    </div>

    <div class="pt-2">
      <button type="button" class="rounded bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-400" :disabled="false" @click="goNext">
        Next
      </button>
    </div>
  </section>
</template>
