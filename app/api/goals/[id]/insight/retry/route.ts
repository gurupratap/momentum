import { NextRequest, NextResponse, after } from 'next/server'
import { Prisma } from '@/app/generated/prisma/client'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { analyzeGoal } from '@/lib/ai/goal-agent'

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
  })

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  if (goal.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Get insight
  const insight = await prisma.goalInsight.findUnique({
    where: { goalId },
  })

  if (!insight) {
    return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
  }

  if (insight.status !== 'FAILED') {
    return NextResponse.json(
      { error: 'Can only retry failed analyses' },
      { status: 400 }
    )
  }

  // Reset insight to pending
  const updatedInsight = await prisma.goalInsight.update({
    where: { goalId },
    data: {
      status: 'PENDING',
      errorMessage: null,
      analysis: null,
      suggestions: Prisma.JsonNull,
    },
  })

  // Trigger background analysis
  after(async () => {
    await analyzeGoal(goalId)
  })

  return NextResponse.json({ data: updatedInsight })
}
