import { NextRequest, NextResponse, after } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { createHabitsFromSuggestionsSchema } from '@/lib/validations/goal'
import { analyzeHabit } from '@/lib/ai/habit-agent'
import type { SuggestedHabit } from '@/types'

export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: goalId } = await params

  // Verify goal exists and user owns it
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      insight: true,
    },
  })

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  if (goal.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (!goal.insight || goal.insight.status !== 'COMPLETED') {
    return NextResponse.json(
      { error: 'Goal analysis not completed' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const result = createHabitsFromSuggestionsSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors).flat()[0] || 'Validation failed'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const suggestions = goal.insight.suggestions as unknown as SuggestedHabit[]

  if (!suggestions || !Array.isArray(suggestions)) {
    return NextResponse.json(
      { error: 'No suggestions available' },
      { status: 400 }
    )
  }

  // Validate indices
  for (const index of result.data.suggestionIndices) {
    if (index < 0 || index >= suggestions.length) {
      return NextResponse.json(
        { error: `Invalid suggestion index: ${index}` },
        { status: 400 }
      )
    }
  }

  // Create habits from selected suggestions
  const createdHabits = await Promise.all(
    result.data.suggestionIndices.map(async (index) => {
      const suggestion = suggestions[index]

      const habit = await prisma.habit.create({
        data: {
          userId: user.id,
          goalId,
          name: suggestion.name,
          description: suggestion.description,
          frequency: suggestion.frequency,
          frequencyTarget: suggestion.frequencyTarget,
          isAiSuggested: true,
        },
      })

      // Create pending insight
      await prisma.habitInsight.create({
        data: {
          habitId: habit.id,
          status: 'PENDING',
        },
      })

      // Trigger background analysis
      after(async () => {
        await analyzeHabit(habit.id)
      })

      return habit
    })
  )

  return NextResponse.json({ data: createdHabits }, { status: 201 })
}
