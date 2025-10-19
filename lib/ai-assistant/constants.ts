import type { IconKey } from '~/lib/ui/icons'
import type { QuestionType } from '~/stores/profiles'

export type PresetQuestionType = QuestionType & { icon: IconKey }

export const templates = [
  { id: 'elementary_science', name: 'Elementary Science', icon: 'Microscope', iconColorClass: 'text-emerald-500', iconBgClass: 'bg-emerald-50', description: 'K-5 \u0007 Multiple Choice, True/False', subjectArea: 'science', gradeLevel: 'elementary', schoolType: 'public', generalInstructions: 'Focus on basic scientific concepts and observation skills. Use simple language in feedback.', questionTypes: ['multiple_choice','true_false','short_answer'] },
  { id: 'middle_school_stem', name: 'Middle School STEM', icon: 'Atom', iconColorClass: 'text-blue-500', iconBgClass: 'bg-blue-50', description: '6-8 \u0007 Short Answer, Math Problems', subjectArea: 'science', gradeLevel: 'middle_school', schoolType: 'public', generalInstructions: 'Encourage scientific reasoning and problem-solving. Award partial credit for showing work.', questionTypes: ['short_answer','math_problem','lab_analysis'] },
  { id: 'high_school_biology', name: 'High School Biology', icon: 'Dna', iconColorClass: 'text-purple-500', iconBgClass: 'bg-purple-50', description: '9-12 \u0007 Essays, Lab Analysis', subjectArea: 'biology', gradeLevel: 'high_school', schoolType: 'public', generalInstructions: 'Focus on biological processes and scientific terminology. Evaluate depth of understanding.', questionTypes: ['short_answer','essay','lab_analysis','diagram_interpretation'] },
  { id: 'blank', name: 'Start from Scratch', icon: 'Plus', iconColorClass: 'text-slate-400', iconBgClass: 'bg-slate-100', description: 'Custom profile', questionTypes: [] },
] as const

export const presetQuestionTypes: PresetQuestionType[] = [
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

