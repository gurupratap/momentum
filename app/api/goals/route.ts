import { NextRequest, NextResponse, after } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { createGoalSchema } from '@/lib/validations/goal'
import { analyzeGoal } from '@/lib/ai/goal-agent'

export const maxDuration = 60

export async function GET() {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { habits: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: goals })
}

export async function POST(request: NextRequest) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = createGoalSchema.safeParse(body)

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

  // Parse targetDate if provided
  const targetDate = result.data.targetDate ? new Date(result.data.targetDate) : null

  const goal = await prisma.goal.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      category: result.data.category,
      targetDate,
      userId: user.id,
    },
  })

  // Create pending insight and kick off background analysis
  await prisma.goalInsight.create({
    data: {
      goalId: goal.id,
      status: 'PENDING',
    },
  })

  after(async () => {
    await analyzeGoal(goal.id)
  })

  return NextResponse.json({ data: goal }, { status: 201 })
}
