import { z } from 'zod'

export const frequencyTypeSchema = z.enum(['DAILY', 'WEEKLY', 'CUSTOM'])

export const goalStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED'])

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
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
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  purpose: z
    .string()
    .min(20, 'Purpose must be at least 20 characters')
    .max(1000, 'Purpose must be 1000 characters or less'),
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
).refine(
  (data) => {
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      return false
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: goalStatusSchema.optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
