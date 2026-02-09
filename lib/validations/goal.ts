import { z } from 'zod'

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum([
    'HEALTH', 'FITNESS', 'PRODUCTIVITY', 'LEARNING',
    'MINDFULNESS', 'RELATIONSHIPS', 'CAREER', 'FINANCE',
    'PERSONAL', 'OTHER'
  ]).optional(),
  targetDate: z.string().datetime().optional()
})

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum([
    'HEALTH', 'FITNESS', 'PRODUCTIVITY', 'LEARNING',
    'MINDFULNESS', 'RELATIONSHIPS', 'CAREER', 'FINANCE',
    'PERSONAL', 'OTHER'
  ]).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ACHIEVED', 'ABANDONED']).optional(),
  targetDate: z.string().datetime().optional()
})

export const createHabitsFromSuggestionsSchema = z.object({
  suggestionIndices: z.array(z.number().int().min(0)).min(1).max(5)
})
