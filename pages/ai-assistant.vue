<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProfilesStore, type QuestionType } from '~/stores/profiles'

useHead({ title: 'AI Assistant • Profiles' })

const profiles = useProfilesStore()
const step = ref<1 | 2 | 3>(1)

const templates = [
  { id: 'elementary_science', name: 'Elementary Science', subject: 'science', gradeLevel: 'K-5', description: 'Multiple Choice, True/False' },
  { id: 'middle_school_stem', name: 'Middle School STEM', subject: 'stem', gradeLevel: '6-8', description: 'Short Answer, Math Problems' },
  { id: 'high_school_biology', name: 'High School Biology', subject: 'biology', gradeLevel: '9-12', description: 'Essays, Lab Analysis' },
  { id: 'blank', name: 'Custom Profile', subject: '', gradeLevel: '', description: '' },
]

const presetTypes: QuestionType[] = [
  { id: 'multiple_choice', name: 'Multiple Choice', description: 'Exact answers only, no partial credit' },
  { id: 'short_answer', name: 'Short Answer', description: 'Partial credit for correct concepts' },
  { id: 'essay', name: 'Essay/Long Response', description: 'Evaluates structure, evidence, clarity' },
  { id: 'math_problem', name: 'Math Problems', description: 'Points for method, partial credit' },
]

const id = ref('')
const name = ref('')
const subject = ref('')
const gradeLevel = ref('')
const description = ref('')
const selectedTypes = ref<QuestionType[]>([])

const canContinueStep1 = computed(() => !!id.value && !!name.value)
const canSave = computed(() => selectedTypes.value.length > 0 && canContinueStep1.value)

function applyTemplate(t: typeof templates[number]) {
  if (t.id !== 'blank') {
    name.value = t.name
    subject.value = t.subject
    gradeLevel.value = t.gradeLevel
    description.value = t.description
    if (!id.value) id.value = t.id
  }
}

function toggleType(t: QuestionType) {
  const i = selectedTypes.value.findIndex(x => x.id === t.id)
  if (i >= 0) selectedTypes.value.splice(i, 1)
  else selectedTypes.value.push(t)
}

const customName = ref('')
const customInstructions = ref('')
function addCustomType() {
  if (!customName.value.trim()) return
  const t: QuestionType = {
    id: `custom_${Math.random().toString(36).slice(2, 8)}`,
    name: customName.value.trim(),
    description: 'Custom',
    instructions: customInstructions.value.trim() || undefined,
  }
  selectedTypes.value.push(t)
  customName.value = ''
  customInstructions.value = ''
}

function saveProfile() {
  if (!canSave.value) return
  profiles.add({
    id: id.value.trim(),
    name: name.value.trim(),
    subject: subject.value.trim() || undefined,
    gradeLevel: gradeLevel.value.trim() || undefined,
    description: description.value.trim() || undefined,
    questionTypes: selectedTypes.value,
  })
  step.value = 3
}

function resetWizard() {
  step.value = 1
  id.value = ''
  name.value = ''
  subject.value = ''
  gradeLevel.value = ''
  description.value = ''
  selectedTypes.value = []
}
</script>

<template>
  <div class="space-y-10 pb-16">
    <PageHeader
      eyebrow="AI assistant"
      title="Create grading profiles"
      description="Generate and save reusable grading profiles with question-type instructions."
    >
      <template #actions>
        <NuxtLink
          to="/grading-wizard"
          class="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          Back to Wizard
        </NuxtLink>
      </template>
    </PageHeader>

    <section class="grid gap-6 px-6 lg:grid-cols-3">
      <aside class="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <h3 class="font-semibold text-slate-900 dark:text-white">My Profiles</h3>
        <div v-if="profiles.profiles.length === 0" class="text-sm text-slate-500 dark:text-slate-400">No profiles yet.</div>
        <ul v-else class="space-y-2 text-sm">
          <li v-for="p in profiles.profiles" :key="p.id" class="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/80 p-3 dark:border-slate-700/60 dark:bg-slate-900/60">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ p.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ p.id }}</p>
            </div>
            <NuxtLink :to="{ path: '/grading-wizard' }" class="text-sm text-brand-600 hover:underline">Use</NuxtLink>
          </li>
        </ul>
      </aside>

      <div class="lg:col-span-2 space-y-6">
        <div class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Quick start</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button v-for="t in templates" :key="t.id" type="button" class="rounded-xl border border-slate-300 p-4 text-left hover:border-brand-400 dark:border-slate-700" @click="applyTemplate(t)">
              <p class="font-medium text-slate-900 dark:text-white">{{ t.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ t.description || 'Custom profile' }}</p>
            </button>
          </div>
        </div>

        <div class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div class="mb-6 flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs', step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-300 text-slate-600']">1</div>
              <span class="text-slate-700 dark:text-slate-200">Profile Info</span>
            </div>
            <div class="w-8 h-px bg-slate-300 dark:bg-slate-700"></div>
            <div class="flex items-center gap-2">
              <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs', step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-300 text-slate-600']">2</div>
              <span class="text-slate-700 dark:text-slate-200">Question Types</span>
            </div>
          </div>

          <div v-if="step === 1" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Profile ID</label>
                <input v-model="id" type="text" placeholder="eg. spring-2025-bio101" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
                <input v-model="name" type="text" placeholder="High School Biology" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Subject</label>
                <input v-model="subject" type="text" placeholder="biology" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Grade Level</label>
                <input v-model="gradeLevel" type="text" placeholder="9-12" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
              <textarea v-model="description" rows="2" placeholder="Notes about this profile" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"></textarea>
            </div>
            <div class="flex justify-end">
              <button type="button" class="rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50" :disabled="!canContinueStep1" @click="step = 2">Continue</button>
            </div>
          </div>

          <div v-else-if="step === 2" class="space-y-6">
            <div>
              <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Select Question Types You Use</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <label v-for="t in presetTypes" :key="t.id" class="flex items-start gap-3 rounded-xl border border-slate-300 p-3 hover:border-brand-400 dark:border-slate-700">
                  <input type="checkbox" :checked="selectedTypes.some(x => x.id === t.id)" @change="toggleType(t)">
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ t.name }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ t.description }}</p>
                  </div>
                </label>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Each type has optimized AI grading instructions built-in.</p>
            </div>

            <div class="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Add Custom Question Types</h4>
              <div class="flex gap-3">
                <input v-model="customName" type="text" placeholder="Type name (e.g., 'Lab Report Analysis')" class="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                <textarea v-model="customInstructions" rows="2" placeholder="Grading instructions for this type..." class="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"></textarea>
                <button type="button" class="rounded border px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" @click="addCustomType">Add</button>
              </div>
            </div>

            <div>
              <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Your Question Types ({{ selectedTypes.length }})</h4>
              <div class="min-h-[100px] rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700">
                <div v-if="selectedTypes.length === 0" class="text-slate-500 dark:text-slate-400">No question types selected yet</div>
                <ul v-else class="space-y-1">
                  <li v-for="t in selectedTypes" :key="t.id" class="flex items-center justify-between">
                    <span>{{ t.name }}</span>
                    <button type="button" class="text-xs text-slate-500 hover:underline" @click="toggleType(t)">Remove</button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="flex justify-between">
              <button type="button" class="rounded border px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" @click="step = 1">Back</button>
              <button type="button" class="rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50" :disabled="!canSave" @click="saveProfile">Save Profile</button>
            </div>
          </div>

          <div v-else class="text-center py-10">
            <div class="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center">✓</div>
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">Profile Created Successfully</h3>
            <p class="text-slate-600 dark:text-slate-300 mb-6">Your grading profile is ready to use with rubrics.</p>
            <div class="flex gap-3 justify-center">
              <NuxtLink to="/grading-wizard" class="rounded bg-brand-600 px-4 py-2 font-semibold text-white">Use in Wizard</NuxtLink>
              <button type="button" class="rounded border px-4 py-2" @click="resetWizard">Create Another</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

