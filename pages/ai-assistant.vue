<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Atom,
  BarChart3,
  Calculator,
  Check,
  CheckCircle,
  Code,
  Dna,
  Edit3,
  FileText,
  FlaskRound,
  Folder,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Microscope,
  Plus,
  Save,
  ToggleLeft,
  Trash2,
  Zap,
} from 'lucide-vue-next'
import { useProfilesStore, type QuestionType } from '~/stores/profiles'

useHead({ title: 'AI Assistant · Profiles' })

const icons = {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Atom,
  BarChart3,
  Calculator,
  Check,
  CheckCircle,
  Code,
  Dna,
  Edit3,
  FileText,
  FlaskRound,
  Folder,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Microscope,
  Plus,
  Save,
  ToggleLeft,
  Trash2,
  Zap,
} as const

type IconKey = keyof typeof icons

interface PresetQuestionType extends QuestionType {
  icon: IconKey
}

interface SelectedQuestionType extends QuestionType {
  icon: IconKey
  isCustom?: boolean
}

interface ProfileTemplate {
  id: string
  name: string
  icon: IconKey
  iconColorClass: string
  iconBgClass: string
  description: string
  subjectArea?: string
  gradeLevel?: string
  schoolType?: string
  generalInstructions?: string
  questionTypes: string[]
}

const profilesStore = useProfilesStore()

const step = ref<1 | 2 | 3>(1)
const validationError = ref('')
const customTypeSuccess = ref('')

const form = reactive({
  name: '',
  subjectArea: '',
  gradeLevel: '',
  schoolType: 'public',
  generalInstructions: '',
})

const templates: ProfileTemplate[] = [
  {
    id: 'elementary_science',
    name: 'Elementary Science',
    icon: 'Microscope',
    iconColorClass: 'text-emerald-500',
    iconBgClass: 'bg-emerald-50',
    description: 'K-5 • Multiple Choice, True/False',
    subjectArea: 'science',
    gradeLevel: 'elementary',
    schoolType: 'public',
    generalInstructions:
      'Focus on basic scientific concepts and observation skills. Use simple language in feedback.',
    questionTypes: ['multiple_choice', 'true_false', 'short_answer'],
  },
  {
    id: 'middle_school_stem',
    name: 'Middle School STEM',
    icon: 'Atom',
    iconColorClass: 'text-blue-500',
    iconBgClass: 'bg-blue-50',
    description: '6-8 • Short Answer, Math Problems',
    subjectArea: 'science',
    gradeLevel: 'middle_school',
    schoolType: 'public',
    generalInstructions:
      'Encourage scientific reasoning and problem-solving. Award partial credit for showing work.',
    questionTypes: ['short_answer', 'math_problem', 'lab_analysis'],
  },
  {
    id: 'high_school_biology',
    name: 'High School Biology',
    icon: 'Dna',
    iconColorClass: 'text-purple-500',
    iconBgClass: 'bg-purple-50',
    description: '9-12 • Essays, Lab Analysis',
    subjectArea: 'biology',
    gradeLevel: 'high_school',
    schoolType: 'public',
    generalInstructions:
      'Focus on biological processes and scientific terminology. Evaluate depth of understanding.',
    questionTypes: ['short_answer', 'essay', 'lab_analysis', 'diagram_interpretation'],
  },
  {
    id: 'blank',
    name: 'Start from Scratch',
    icon: 'Plus',
    iconColorClass: 'text-slate-400',
    iconBgClass: 'bg-slate-100',
    description: 'Custom profile',
    questionTypes: [],
  },
]

const presetQuestionTypes: PresetQuestionType[] = [
  {
    id: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Exact answers only, no partial credit',
    icon: 'CheckCircle',
  },
  {
    id: 'short_answer',
    name: 'Short Answer',
    description: 'Partial credit for correct concepts',
    icon: 'MessageSquare',
  },
  {
    id: 'essay',
    name: 'Essay / Long Response',
    description: 'Evaluates structure, evidence, clarity',
    icon: 'FileText',
  },
  {
    id: 'math_problem',
    name: 'Math Problems',
    description: 'Credit for method + work shown',
    icon: 'Calculator',
  },
  {
    id: 'fill_blank',
    name: 'Fill in the Blank',
    description: 'Accepts equivalent answers',
    icon: 'Edit3',
  },
  {
    id: 'true_false',
    name: 'True/False',
    description: 'Full credit for correct choice',
    icon: 'ToggleLeft',
  },
  {
    id: 'lab_analysis',
    name: 'Lab Analysis',
    description: 'Evaluates hypothesis and methodology',
    icon: 'FlaskRound',
  },
  {
    id: 'diagram_interpretation',
    name: 'Diagram/Chart Analysis',
    description: 'Visual data interpretation skills',
    icon: 'BarChart3',
  },
  {
    id: 'code_review',
    name: 'Code Review',
    description: 'Programming logic and syntax',
    icon: 'Code',
  },
]

const selectedTypes = ref<SelectedQuestionType[]>([])

function toSelectedType(type: PresetQuestionType): SelectedQuestionType {
  return { ...type }
}

const smartSuggestions: Record<string, Record<string, string[]>> = {
  biology: {
    elementary: ['multiple_choice', 'short_answer', 'diagram_interpretation'],
    middle_school: ['multiple_choice', 'short_answer', 'lab_analysis', 'diagram_interpretation'],
    high_school: ['short_answer', 'essay', 'lab_analysis', 'diagram_interpretation'],
    college: ['essay', 'lab_analysis', 'diagram_interpretation'],
  },
  mathematics: {
    elementary: ['multiple_choice', 'fill_blank', 'math_problem'],
    middle_school: ['multiple_choice', 'short_answer', 'math_problem'],
    high_school: ['short_answer', 'math_problem'],
    college: ['math_problem', 'essay'],
  },
  english: {
    elementary: ['multiple_choice', 'short_answer', 'fill_blank'],
    middle_school: ['short_answer', 'essay'],
    high_school: ['essay', 'short_answer'],
    college: ['essay'],
  },
  science: {
    elementary: ['multiple_choice', 'true_false', 'short_answer'],
    middle_school: ['multiple_choice', 'short_answer', 'lab_analysis'],
    high_school: ['short_answer', 'lab_analysis', 'diagram_interpretation'],
    college: ['essay', 'lab_analysis'],
  },
}

const suggestedIds = ref<string[]>([])

watch(
  () => [form.subjectArea, form.gradeLevel],
  () => {
    validationError.value = ''
    if (!form.subjectArea || !form.gradeLevel) {
      suggestedIds.value = []
      return
    }

    const subjectMap = smartSuggestions[form.subjectArea]
    const defaultMap = smartSuggestions.science
    suggestedIds.value = subjectMap?.[form.gradeLevel] || defaultMap?.[form.gradeLevel] || []
  },
  { immediate: true },
)

const suggestedNames = computed(() =>
  suggestedIds.value
    .map(id => presetQuestionTypes.find(type => type.id === id)?.name)
    .filter((name): name is string => Boolean(name))
    .join(', '),
)

const hasSuggestions = computed(() => suggestedIds.value.length > 0)

const canContinueStep1 = computed(
  () => form.name.trim().length > 0 && form.subjectArea !== '' && form.gradeLevel !== '',
)

const selectedTypeCount = computed(() => selectedTypes.value.length)

const canSaveProfile = computed(() => selectedTypeCount.value > 0 && canContinueStep1.value)

const customType = reactive({
  name: '',
  instructions: '',
})

function resetWizard() {
  form.name = ''
  form.subjectArea = ''
  form.gradeLevel = ''
  form.schoolType = 'public'
  form.generalInstructions = ''
  selectedTypes.value = []
  customType.name = ''
  customType.instructions = ''
  validationError.value = ''
  customTypeSuccess.value = ''
  suggestedIds.value = []
  step.value = 1
}

function applyTemplate(template: ProfileTemplate) {
  if (template.id === 'blank') {
    resetWizard()
    return
  }

  form.name = template.name
  form.subjectArea = template.subjectArea || ''
  form.gradeLevel = template.gradeLevel || ''
  form.schoolType = template.schoolType || 'public'
  form.generalInstructions = template.generalInstructions || ''

  selectedTypes.value = template.questionTypes
    .map(id => presetQuestionTypes.find(type => type.id === id))
    .filter((type): type is PresetQuestionType => Boolean(type))
    .map(toSelectedType)

  validationError.value = ''
  customTypeSuccess.value = ''
  step.value = 1
}

function togglePresetType(type: PresetQuestionType) {
  const existingIndex = selectedTypes.value.findIndex(selected => selected.id === type.id)
  if (existingIndex >= 0) {
    selectedTypes.value.splice(existingIndex, 1)
  } else {
    selectedTypes.value.push(toSelectedType(type))
  }
  validationError.value = ''
  customTypeSuccess.value = ''
}

function removeType(id: string) {
  const index = selectedTypes.value.findIndex(type => type.id === id)
  if (index >= 0) selectedTypes.value.splice(index, 1)
  customTypeSuccess.value = ''
}

function goToStep(target: 1 | 2 | 3) {
  if (target === 2 && !canContinueStep1.value) {
    validationError.value = 'Please fill in all required fields (name, subject, and grade level).'
    return
  }

  validationError.value = ''
  customTypeSuccess.value = ''
  step.value = target
}

function applySuggestions() {
  suggestedIds.value.forEach(id => {
    if (selectedTypes.value.some(type => type.id === id)) return
    const preset = presetQuestionTypes.find(type => type.id === id)
    if (preset) selectedTypes.value.push(toSelectedType(preset))
  })
  customTypeSuccess.value = ''
  validationError.value = ''
}

function addCustomType() {
  const name = customType.name.trim()
  const instructions = customType.instructions.trim()

  if (!name || !instructions) {
    validationError.value = 'Please provide both name and instructions for the custom question type.'
    return
  }

  selectedTypes.value.push({
    id: `custom_${Math.random().toString(36).slice(2, 8)}`,
    name,
    description: 'Custom question type',
    instructions,
    icon: 'Plus',
    isCustom: true,
  })

  customType.name = ''
  customType.instructions = ''
  validationError.value = ''
  customTypeSuccess.value = `Custom question type "${name}" added successfully!`
}

function saveProfile() {
  if (!canSaveProfile.value) {
    validationError.value = 'Please add at least one question type before saving your profile.'
    return
  }

  const id = form.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `profile-${Date.now()}`

  profilesStore.add({
    id,
    name: form.name.trim(),
    subjectArea: form.subjectArea,
    gradeLevel: form.gradeLevel,
    schoolType: form.schoolType,
    generalInstructions: form.generalInstructions.trim() || undefined,
    questionTypes: selectedTypes.value.map(({ icon: _icon, isCustom, ...rest }) => rest),
  })

  step.value = 3
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">AI Assistant</h1>
      <p class="text-slate-600">
        Create intelligent grading profiles with question-type specific instructions for consistent, efficient assessment.
      </p>
    </div>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <aside class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-2 text-slate-900">
          <component :is="icons.Folder" class="h-5 w-5 text-blue-500" aria-hidden="true" />
          <h2 class="text-lg font-semibold">My Profiles</h2>
        </div>
        <div v-if="profilesStore.profiles.length === 0" class="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          No profiles yet. Create your first profile!
        </div>
        <ul v-else class="space-y-3 text-sm">
          <li
            v-for="profile in profilesStore.profiles"
            :key="profile.id"
            class="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div>
              <p class="font-medium text-slate-900">{{ profile.name }}</p>
              <p class="text-xs text-slate-500">Subject: {{ profile.subjectArea || '—' }}</p>
              <p class="text-xs text-slate-500">Grade Level: {{ profile.gradeLevel || '—' }}</p>
            </div>
            <NuxtLink
              :to="{ path: '/grading-wizard' }"
              class="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Use
            </NuxtLink>
          </li>
        </ul>
      </aside>

      <div class="lg:col-span-2 space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-slate-900">
            <component :is="icons.Zap" class="h-5 w-5 text-amber-500" aria-hidden="true" />
            <h2 class="text-lg font-semibold">Quick Start</h2>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <button
              v-for="template in templates"
              :key="template.id"
              type="button"
              class="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400"
              @click="applyTemplate(template)
              "
            >
              <div class="flex flex-col items-center text-center">
                <div
                  class="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                  :class="template.iconBgClass"
                >
                  <component :is="icons[template.icon]" class="h-6 w-6" :class="template.iconColorClass" aria-hidden="true" />
                </div>
                <div class="font-medium text-slate-900">{{ template.name }}</div>
                <div class="text-xs text-slate-500">{{ template.description }}</div>
              </div>
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-center gap-4 text-sm font-medium text-slate-600">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500',
                ]"
              >
                1
              </div>
              <span class="text-slate-700">Profile Info</span>
            </div>
            <div class="h-px w-10 bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500',
                ]"
              >
                2
              </div>
              <span class="text-slate-700">Question Types</span>
            </div>
          </div>

          <div v-if="validationError" class="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <component :is="icons.AlertCircle" class="mt-0.5 h-5 w-5" aria-hidden="true" />
            <span>{{ validationError }}</span>
          </div>

          <div v-if="customTypeSuccess" class="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <component :is="icons.CheckCircle" class="mt-0.5 h-5 w-5" aria-hidden="true" />
            <span>{{ customTypeSuccess }}</span>
          </div>

          <div v-if="step === 1" class="space-y-6">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-slate-700">Profile Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g., '8th Grade Biology Midterm'"
                  class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Subject Area</label>
                <select
                  v-model="form.subjectArea"
                  class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select subject...</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="english">English Language Arts</option>
                  <option value="history">History</option>
                  <option value="geography">Geography</option>
                  <option value="computer_science">Computer Science</option>
                  <option value="art">Art</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Grade Level</label>
                <select
                  v-model="form.gradeLevel"
                  class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select grade...</option>
                  <option value="elementary">Elementary (K-5)</option>
                  <option value="middle_school">Middle School (6-8)</option>
                  <option value="high_school">High School (9-12)</option>
                  <option value="college">College/University</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">School Type</label>
                <select
                  v-model="form.schoolType"
                  class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="public">Public School</option>
                  <option value="private">Private School</option>
                  <option value="charter">Charter School</option>
                  <option value="homeschool">Homeschool</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div
              v-if="hasSuggestions"
              class="rounded-lg border border-blue-200 bg-blue-50 p-4"
            >
              <div class="flex items-start gap-3">
                <component :is="icons.Lightbulb" class="mt-0.5 h-5 w-5 text-blue-500" aria-hidden="true" />
                <div class="text-sm text-blue-700">
                  <h4 class="mb-2 font-medium">💡 Suggested for this subject &amp; grade:</h4>
                  <p class="mb-3">{{ suggestedNames }}</p>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                    @click="applySuggestions"
                  >
                    Quick Add These Types
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">General Grading Instructions</label>
              <textarea
                v-model="form.generalInstructions"
                rows="3"
                placeholder="e.g., 'Focus on scientific reasoning. Award partial credit for correct methodology even if final answer is incorrect.'"
                class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              ></textarea>
              <p class="mt-1 text-xs text-slate-500">These instructions apply to all question types in this profile.</p>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                :disabled="!canContinueStep1"
                @click="goToStep(2)"
              >
                Next: Add Question Types
                <component :is="icons.ArrowRight" class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div v-else-if="step === 2" class="space-y-6">
            <div>
              <h4 class="mb-3 text-lg font-medium text-slate-900">Select Question Types You Use</h4>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label
                  v-for="type in presetQuestionTypes"
                  :key="type.id"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-400"
                >
                  <input
                    type="checkbox"
                    class="mt-1 text-blue-600"
                    :checked="selectedTypes.some(selected => selected.id === type.id)"
                    @change="togglePresetType(type)"
                  />
                  <div class="flex-1">
                    <div class="mb-1 flex items-center gap-2">
                      <component :is="icons[type.icon]" class="h-4 w-4 text-blue-500" aria-hidden="true" />
                      <span class="font-medium text-slate-900">{{ type.name }}</span>
                    </div>
                    <p class="text-sm text-slate-500">{{ type.description }}</p>
                  </div>
                </label>
              </div>
              <p class="mt-2 text-xs text-slate-500">Each type has optimized AI grading instructions built-in.</p>
            </div>

            <div class="border-t border-slate-200 pt-4">
              <h4 class="mb-3 text-lg font-medium text-slate-900">Add Custom Question Types</h4>
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div class="space-y-3">
                  <input
                    v-model="customType.name"
                    type="text"
                    placeholder="Type name (e.g., 'Lab Report Analysis')"
                    class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <div class="flex flex-col gap-3 md:flex-row">
                    <textarea
                      v-model="customType.instructions"
                      rows="3"
                      placeholder="Grading instructions for this question type..."
                      class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    ></textarea>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
                      @click="addCustomType"
                    >
                      <component :is="icons.Plus" class="h-4 w-4" aria-hidden="true" />
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
                  <component :is="icons.HelpCircle" class="h-6 w-6 text-slate-400" aria-hidden="true" />
                  <p>No question types selected yet</p>
                  <p class="text-xs">Select types from above to see them here</p>
                </div>
                <div
                  v-else
                  v-for="type in selectedTypes"
                  :key="type.id"
                  class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <component :is="icons[type.icon]" class="h-5 w-5 text-blue-500" aria-hidden="true" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-slate-900">{{ type.name }}</span>
                        <span v-if="type.isCustom" class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">Custom</span>
                      </div>
                      <p class="text-xs text-slate-500">
                        {{ type.isCustom ? type.instructions : type.description }}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    @click="removeType(type.id)"
                  >
                    <component :is="icons.Trash2" class="h-4 w-4" aria-hidden="true" />
                    <span class="sr-only">Remove {{ type.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
                @click="goToStep(1)"
              >
                <component :is="icons.ArrowLeft" class="h-4 w-4" aria-hidden="true" />
                Back to Profile Info
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                :disabled="!canSaveProfile"
                @click="saveProfile"
              >
                <component :is="icons.Save" class="h-4 w-4" aria-hidden="true" />
                Save Profile
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <component :is="icons.Check" class="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900">Profile Created Successfully!</h3>
            <p class="mt-2 text-slate-600">Your grading profile is ready to use with rubrics.</p>
            <div class="mt-6 flex justify-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600"
                @click="resetWizard"
              >
                <component :is="icons.Plus" class="h-4 w-4" aria-hidden="true" />
                Create Another
              </button>
              <NuxtLink
                to="/grading-wizard"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Use in Wizard
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
