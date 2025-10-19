export const iconMap = {
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
  Edit3: 'lucide:edit-3',
  MessageSquare: 'lucide:message-square',
  Lightbulb: 'lucide:lightbulb',
  ToggleLeft: 'lucide:toggle-left',
  Plus: 'lucide:plus',
  Microscope: 'mdi:microscope',
  Dna: 'mdi:dna',
  FlaskRound: 'mdi:flask-round-bottom',
  Atom: 'mdi:atom',
} as const

export type IconKey = keyof typeof iconMap

