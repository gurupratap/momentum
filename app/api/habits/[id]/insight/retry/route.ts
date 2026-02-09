import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { analyzeHabit } from '@/lib/ai/habit-agent'

type RouteParams = { params: Promise<{ id: string }> }

export const maxDuration = 60

export async function POST(_request: NextRequest, { params }: RouteParams) {
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

  const insight = await prisma.habitInsight.findUnique({
    where: { habitId: id },
  })

  if (!insight || insight.status !== 'FAILED') {
    return NextResponse.json({ error: 'Can only retry failed insights' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { insightId: insight.id } }),
    prisma.habitInsight.update({
      where: { id: insight.id },
      data: { status: 'PENDING', errorMessage: null, research: null, opikTraceId: null },
    }),
  ])

  after(async () => {
    await analyzeHabit(id)
  })

  return NextResponse.json({ data: { retrying: true } })
}
