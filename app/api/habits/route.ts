import { NextRequest, NextResponse, after } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { createHabitSchema } from '@/lib/validations/habit'
import { analyzeHabit } from '@/lib/ai/habit-agent'

export const maxDuration = 60

export async function GET() {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: habits })
}

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = createHabitSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors).flat()[0] || 'Validation failed'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  // Ensure user exists in our database (sync from StackAuth)
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.primaryEmail || '', name: user.displayName },
    create: { id: user.id, email: user.primaryEmail || '', name: user.displayName },
  })

  // Verify goal exists and user owns it
  const goal = await prisma.goal.findUnique({
    where: { id: result.data.goalId },
  })

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  if (goal.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const habit = await prisma.habit.create({
    data: {
      ...result.data,
      userId: user.id,
      isAiSuggested: false, // Manual habits are not AI suggested
    },
  })

  // Create pending insight and kick off background analysis
  await prisma.habitInsight.create({
    data: {
      habitId: habit.id,
      status: 'PENDING',
    },
  })

  after(async () => {
    await analyzeHabit(habit.id)
  })

  return NextResponse.json({ data: habit }, { status: 201 })
}
