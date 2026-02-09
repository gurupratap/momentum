import { NextRequest, NextResponse, after } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { analyzeGoal } from '@/lib/ai/goal-agent'

export async function GET(
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

  // Get or create insight
  let insight = await prisma.goalInsight.findUnique({
    where: { goalId },
  })

  if (!insight) {
    // Auto-create if missing (backward compat)
    insight = await prisma.goalInsight.create({
      data: {
        goalId,
        status: 'PENDING',
      },
    })

    // Trigger background analysis
    after(async () => {
      await analyzeGoal(goalId)
    })
  }

  return NextResponse.json({ data: insight })
}
