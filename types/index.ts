import type {
  Habit,
  User,
  FrequencyType,
  HabitStatus,
  HabitInsight,
  Question,
  InsightStatus,
  Goal,
  GoalInsight,
  GoalStatus,
  GoalCategory
} from '@/app/generated/prisma/client'

// Re-export Prisma types
export type {
  Habit,
  User,
  FrequencyType,
  HabitStatus,
  HabitInsight,
  Question,
  InsightStatus,
  Goal,
  GoalInsight,
  GoalStatus,
  GoalCategory
}

// Question option shape (matches JSON stored in Question.options)
export type QuestionOption = {
  key: string
  text: string
}

// Suggested habit from AI
export type SuggestedHabit = {
  name: string
  description: string
  frequency: FrequencyType
  frequencyTarget?: number | null
  rationale: string
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'moderate' | 'challenging'
}

// Insight with questions for API responses
export type HabitInsightWithQuestions = HabitInsight & {
  questions: Question[]
}

// Goal with habits for API responses
export type GoalWithHabits = Goal & {
  habits: Habit[]
  _count: { habits: number }
}

// Goal insight with suggestions
export type GoalInsightWithSuggestions = GoalInsight & {
  suggestions: SuggestedHabit[]
}

// API Response types
export type ApiResponse<T> = {
  data?: T
  error?: string
}

// Goal form data (for creating goals)
export type GoalFormData = {
  title: string
  description?: string
  category?: GoalCategory
  targetDate?: string
}

// Habit form data (for creating habits)
export type HabitFormData = {
  goalId: string
  name: string
  description?: string
  frequency: FrequencyType
  frequencyTarget?: number
}
