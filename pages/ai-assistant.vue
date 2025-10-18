<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useProfilesStore, type QuestionType } from '~/stores/profiles'

useHead({ title: 'AI Assistant • Profiles' })

// Icon map for nuxt-icon (Iconify collections)
const iconMap = {
  Folder: 'lucide:folder',
  Zap: 'lucide:zap',
  AlertCircle: 'lucide:circle-alert',
  CheckCircle: 'lucide:check-circle-2',
  HelpCircle: 'lucide:help-circle',
  Save: 'lucide:save',
  Trash2: 'lucide:trash-2',
  ArrowLeft: 'lucide:arrow-left',
  ArrowRight: 'lucide:arrow-right',
  BarChart3: 'lucide:bar-chart-3',
  Calculator: 'lucide:calculator',
  Code: 'lucide:code',
  FileText: 'lucide:file-text',
  MessageSquare: 'lucide:message-square',
  Lightbulb: 'lucide:lightbulb',
  ToggleLeft: 'lucide:toggle-left',
  Plus: 'lucide:plus',
  Microscope: 'mdi:microscope',
  Dna: 'mdi:dna',
  FlaskRound: 'mdi:flask-round-bottom',
  Atom: 'mdi:atom',
} as const

type IconKey = keyof typeof iconMap

interface PresetQuestionType extends QuestionType { icon: IconKey }
interface SelectedQuestionType extends QuestionType { icon: IconKey; isCustom?: boolean; instructions?: string }

const profilesStore = useProfilesStore()
const step = ref<1 | 2 | 3>(1)
const validationError = ref('')
const customTypeSuccess = ref('')

const form = reactive({
  id: '',
  name: '',
  subjectArea: '',
  gradeLevel: '',
  schoolType: 'public',
  generalInstructions: '',
})

const templates = [
  { id: 'elementary_science', name: 'Elementary Science', icon: 'Microscope', iconColorClass: 'text-emerald-500', iconBgClass: 'bg-emerald-50', description: 'K-5 • Multiple Choice, True/False', subjectArea: 'science', gradeLevel: 'elementary', schoolType: 'public', generalInstructions: 'Focus on basic scientific concepts and observation skills. Use simple language in feedback.', questionTypes: ['multiple_choice','true_false','short_answer'] },
  { id: 'middle_school_stem', name: 'Middle School STEM', icon: 'Atom', iconColorClass: 'text-blue-500', iconBgClass: 'bg-blue-50', description: '6-8 • Short Answer, Math Problems', subjectArea: 'science', gradeLevel: 'middle_school', schoolType: 'public', generalInstructions: 'Encourage scientific reasoning and problem-solving. Award partial credit for showing work.', questionTypes: ['short_answer','math_problem','lab_analysis'] },
  { id: 'high_school_biology', name: 'High School Biology', icon: 'Dna', iconColorClass: 'text-purple-500', iconBgClass: 'bg-purple-50', description: '9-12 • Essays, Lab Analysis', subjectArea: 'biology', gradeLevel: 'high_school', schoolType: 'public', generalInstructions: 'Focus on biological processes and scientific terminology. Evaluate depth of understanding.', questionTypes: ['short_answer','essay','lab_analysis','diagram_interpretation'] },
  { id: 'blank', name: 'Start from Scratch', icon: 'Plus', iconColorClass: 'text-slate-400', iconBgClass: 'bg-slate-100', description: 'Custom profile', questionTypes: [] },
] as const

const presetQuestionTypes: PresetQuestionType[] = [
  { id: 'multiple_choice', name: 'Multiple Choice', description: 'Exact answers only, no partial credit', icon: 'CheckCircle' },
  { id: 'short_answer', name: 'Short Answer', description: 'Partial credit for correct concepts', icon: 'MessageSquare' },
  { id: 'essay', name: 'Essay / Long Response', description: 'Evaluates structure, evidence, clarity', icon: 'FileText' },
  { id: 'math_problem', name: 'Math Problems', description: 'Credit for method + work shown', icon: 'Calculator' },
  { id: 'fill_blank', name: 'Fill in the Blank', description: 'Accepts equivalent answers', icon: 'Edit3' as IconKey },
  { id: 'true_false', name: 'True/False', description: 'Full credit for correct choice', icon: 'ToggleLeft' },
  { id: 'lab_analysis', name: 'Lab Analysis', description: 'Evaluates hypothesis and methodology', icon: 'FlaskRound' as IconKey },
  { id: 'diagram_interpretation', name: 'Diagram/Chart Analysis', description: 'Visual data interpretation skills', icon: 'BarChart3' },
  { id: 'code_review', name: 'Code Review', description: 'Programming logic and syntax', icon: 'Code' },
]

const selectedTypes = ref<SelectedQuestionType[]>([])
const selectedTypeCount = computed(() => selectedTypes.value.length)
const canContinueStep1 = computed(() => !!form.name && !!form.subjectArea && !!form.gradeLevel)
const canSaveProfile = computed(() => selectedTypes.value.length > 0)

function applyTemplate(t: typeof templates[number]) {
  if (t.id === 'blank') return
  form.name = t.name
  form.subjectArea = (t as any).subjectArea || ''
  form.gradeLevel = (t as any).gradeLevel || ''
  form.schoolType = (t as any).schoolType || 'public'
  form.generalInstructions = (t as any).generalInstructions || ''
  selectedTypes.value = t.questionTypes
    .map(id => presetQuestionTypes.find(pt => pt.id === id))
    .filter(Boolean)
    .map(pt => ({ ...(pt as PresetQuestionType) }))
}

function togglePreset(pt: PresetQuestionType) {
  const i = selectedTypes.value.findIndex(x => x.id === pt.id)
  if (i >= 0) selectedTypes.value.splice(i, 1)
  else selectedTypes.value.push({ ...pt })
}

const customType = reactive({ name: '', instructions: '' })
function addCustomType() {
  if (!customType.name.trim()) { validationError.value = 'Provide a type name.'; return }
  selectedTypes.value.push({ id: `custom_${Math.random().toString(36).slice(2,8)}`, name: customType.name.trim(), description: 'Custom type', icon: 'Plus', isCustom: true, instructions: customType.instructions.trim() })
  customType.name = ''
  customType.instructions = ''
  validationError.value = ''
  customTypeSuccess.value = 'Custom question type added.'
}

function removeType(id: string) {
  selectedTypes.value = selectedTypes.value.filter(t => t.id !== id)
}

function goToStep(n: 1|2|3) { step.value = n }

function saveProfile() {
  if (!canSaveProfile.value) { validationError.value = 'Please add at least one question type before saving your profile.'; return }
  const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || `profile-${Date.now()}`
  profilesStore.add({
    id,
    name: form.name.trim(),
    subject: form.subjectArea || undefined,
    gradeLevel: form.gradeLevel || undefined,
    description: form.generalInstructions || undefined,
    questionTypes: selectedTypes.value.map(({ icon, isCustom, instructions, ...rest }) => rest),
    createdAt: new Date().toISOString(),
  } as any)
  step.value = 3
}

function resetWizard() {
  step.value = 1
  form.id = ''
  form.name = ''
  form.subjectArea = ''
  form.gradeLevel = ''
  form.schoolType = 'public'
  form.generalInstructions = ''
  selectedTypes.value = []
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">AI Assistant</h1>
      <p class="text-slate-600">Create intelligent grading profiles with question-type specific instructions for consistent, efficient assessment.</p>
    </div>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Profiles list -->
      <aside class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-2 text-slate-900">
          <Icon :name="iconMap.Folder" class="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h2 class="text-lg font-semibold">My Profiles</h2>
        </div>
        <div v-if="profilesStore.profiles.length === 0" class="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          No profiles yet. Create your first profile!
        </div>
        <ul v-else class="space-y-3 text-sm">
          <li v-for="profile in profilesStore.profiles" :key="profile.id" class="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p class="font-medium text-slate-900">{{ profile.name }}</p>
              <p class="text-xs text-slate-500">ID: {{ profile.id }}</p>
            </div>
            <NuxtLink :to="{ path: '/grading-wizard' }" class="text-xs font-semibold text-blue-600 hover:text-blue-700">Use</NuxtLink>
          </li>
        </ul>
      </aside>

      <!-- Creator -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Quick start -->
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-slate-900">
            <Icon :name="iconMap.Zap" class="h-5 w-5 text-amber-500" aria-hidden="true" />
            <h2 class="text-lg font-semibold">Quick Start</h2>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <button v-for="t in templates" :key="t.id" type="button" class="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400" @click="applyTemplate(t)">
              <div class="flex flex-col items-center text-center">
                <div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full" :class="t.iconBgClass">
                  <Icon :name="iconMap[t.icon]" class="h-6 w-6" :class="t.iconColorClass" aria-hidden="true" />
                </div>
                <div class="font-medium text-slate-900">{{ t.name }}</div>
                <div class="text-xs text-slate-500">{{ t.description }}</div>
              </div>
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <!-- Stepper -->
          <div class="mb-6 flex items-center gap-4 text-sm font-medium text-slate-600">
            <div class="flex items-center gap-2">
              <div :class="['flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold', step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500']">1</div>
              <span class="text-slate-700">Profile Info</span>
            </div>
            <div class="h-px w-10 bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <div :class="['flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold', step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500']">2</div>
              <span class="text-slate-700">Question Types</span>
            </div>
          </div>

          <!-- Alerts -->
          <div v-if="validationError" class="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <Icon :name="iconMap.AlertCircle" class="mt-0.5 h-5 w-5" aria-hidden="true" />
            <p>{{ validationError }}</p>
          </div>
          <div v-if="customTypeSuccess" class="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <Icon :name="iconMap.CheckCircle" class="mt-0.5 h-5 w-5" aria-hidden="true" />
            <p>{{ customTypeSuccess }}</p>
          </div>

          <!-- Step 1 -->
          <div v-if="step === 1" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-slate-700">Profile ID</label>
                <input v-model="form.id" type="text" placeholder="eg. spring-2025-bio101" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Name</label>
                <input v-model="form.name" type="text" placeholder="High School Biology" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Subject</label>
                <input v-model="form.subjectArea" type="text" placeholder="biology" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Grade Level</label>
                <input v-model="form.gradeLevel" type="text" placeholder="9-12" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">General Instructions</label>
              <textarea v-model="form.generalInstructions" rows="2" placeholder="Notes about this profile" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"></textarea>
            </div>
            <div class="flex justify-end">
              <button type="button" class="rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50" :disabled="!canContinueStep1" @click="goToStep(2)">Continue</button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-else-if="step === 2" class="space-y-6">
            <div>
              <h4 class="mb-3 text-lg font-medium text-slate-900">Select Question Types You Use</h4>
              <div class="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label v-for="pt in presetQuestionTypes" :key="pt.id" class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-3 hover:border-blue-400">
                  <input type="checkbox" class="mt-1" :checked="selectedTypes.some(x => x.id === pt.id)" @change="togglePreset(pt)" />
                  <div>
                    <div class="mb-1 flex items-center gap-2">
                      <Icon :name="iconMap[pt.icon]" class="h-4 w-4 text-blue-500" aria-hidden="true" />
                      <span class="font-medium text-slate-900">{{ pt.name }}</span>
                    </div>
                    <p class="text-sm text-slate-500">{{ pt.description }}</p>
                  </div>
                </label>
              </div>
              <p class="text-xs text-slate-500">Each type has optimized AI grading instructions built-in.</p>
            </div>

            <div class="border-t border-slate-200 pt-4">
              <h4 class="mb-3 text-lg font-medium text-slate-900">Add Custom Question Types</h4>
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div class="space-y-3">
                  <input v-model="customType.name" type="text" placeholder="Type name (e.g., 'Lab Report Analysis')" class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                  <div class="flex flex-col gap-3 md:flex-row">
                    <textarea v-model="customType.instructions" rows="3" placeholder="Grading instructions for this question type..." class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"></textarea>
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600" @click="addCustomType">
                      <Icon :name="iconMap.Plus" class="h-4 w-4" aria-hidden="true" />
                      Add Custom Type
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-3 text-lg font-medium text-slate-900">Your Question Types ({{ selectedTypeCount }})</h4>
              <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div v-if="selectedTypes.length === 0" class="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-slate-500">
                  <Icon :name="iconMap.HelpCircle" class="h-6 w-6 text-slate-400" aria-hidden="true" />
                  <p>No question types selected yet</p>
                  <p class="text-xs">Select types from above to see them here</p>
                </div>
                <div v-else v-for="type in selectedTypes" :key="type.id" class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Icon :name="iconMap[type.icon]" class="h-5 w-5 text-blue-500" aria-hidden="true" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-slate-900">{{ type.name }}</span>
                        <span v-if="type.isCustom" class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">Custom</span>
                      </div>
                      <p class="text-xs text-slate-500">{{ type.isCustom ? type.instructions : type.description }}</p>
                    </div>
                  </div>
                  <button type="button" class="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="removeType(type.id)">
                    <Icon :name="iconMap.Trash2" class="h-4 w-4" aria-hidden="true" />
                    <span class="sr-only">Remove {{ type.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600" @click="goToStep(1)">
                <Icon :name="iconMap.ArrowLeft" class="h-4 w-4" aria-hidden="true" />
                Back to Profile Info
              </button>
              <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50" :disabled="!canSaveProfile" @click="saveProfile">
                <Icon :name="iconMap.Save" class="h-4 w-4" aria-hidden="true" />
                Save Profile
              </button>
            </div>
          </div>

          <!-- Success -->
          <div v-else class="py-12 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">✓</div>
            <h3 class="text-xl font-semibold text-slate-900">Profile Created Successfully!</h3>
            <p class="mt-2 text-slate-600">Your grading profile is ready to use with rubrics.</p>
            <div class="mt-6 flex justify-center gap-3">
              <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600" @click="resetWizard">
                <Icon :name="iconMap.Plus" class="h-4 w-4" aria-hidden="true" />
                Create Another
              </button>
              <NuxtLink to="/grading-wizard" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">Use in Wizard</NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
