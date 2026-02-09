import { z } from 'zod'

export const frequencyTypeSchema = z.enum(['DAILY', 'WEEKLY', 'CUSTOM'])

export const habitStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED'])

export const createHabitSchema = z.object({
  goalId: z.string().cuid('Invalid goal ID'),
  name: z
    .string()
    .min(1, 'Habit name is required')
    .max(100, 'Habit name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  frequency: frequencyTypeSchema,
  frequencyTarget: z
    .number()
    .int()
    .min(1)
    .max(7)
    .optional(),
}).refine(
  (data) => {
    if (data.frequency === 'CUSTOM' && !data.frequencyTarget) {
      return false
    }
    return true
  },
  {
    message: 'Frequency target is required for custom frequency',
    path: ['frequencyTarget'],
  }
)

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  frequency: frequencyTypeSchema.optional(),
  frequencyTarget: z.number().int().min(1).max(7).optional(),
  status: habitStatusSchema.optional(),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
