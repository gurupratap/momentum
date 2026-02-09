import { NextRequest, NextResponse, after } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { analyzeHabit } from '@/lib/ai/habit-agent'

export const maxDuration = 60

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const habit = await prisma.habit.findFirst({
    where: { id, userId: user.id },
  })

  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  let insight = await prisma.habitInsight.findUnique({
    where: { habitId: id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  })

  // Auto-create insight for pre-existing habits that don't have one
  if (!insight) {
    insight = await prisma.habitInsight.create({
      data: { habitId: id, status: 'PENDING' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    after(async () => {
      await analyzeHabit(id)
    })
  }

  return NextResponse.json({ data: insight })
}
