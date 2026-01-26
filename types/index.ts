import type { Goal, User, FrequencyType, GoalStatus } from '@/app/generated/prisma/client'

// Re-export Prisma types
export type { Goal, User, FrequencyType, GoalStatus }

// API Response types
export type ApiResponse<T> = {
  data?: T
  error?: string
}

// Goal form data (for creating/updating goals)
export type GoalFormData = {
  title: string
  description?: string
  frequency: FrequencyType
  frequencyTarget?: number
  startDate: Date
  endDate?: Date
  purpose: string
}

// Goal with user relation
export type GoalWithUser = Goal & {
  user: User
}

// Wizard step types
export type WizardStep = 'details' | 'frequency' | 'timeline' | 'purpose'

export type WizardState = {
  currentStep: WizardStep
  data: Partial<GoalFormData>
  errors: Partial<Record<keyof GoalFormData, string>>
}

export type WizardAction =
  | { type: 'SET_FIELD'; field: keyof GoalFormData; value: unknown }
  | { type: 'SET_ERRORS'; errors: Partial<Record<keyof GoalFormData, string>> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }
