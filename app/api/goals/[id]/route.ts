import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { updateGoalSchema } from '@/lib/validations/goal'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      habits: {
        orderBy: { createdAt: 'desc' }
      },
      insight: true,
      _count: {
        select: { habits: true }
      }
    },
  })

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  if (goal.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({ data: goal })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const goal = await prisma.goal.findUnique({
    where: { id },
  })

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  if (goal.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const result = updateGoalSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors).flat()[0] || 'Validation failed'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  // Parse targetDate if provided
  const updateData: Record<string, unknown> = { ...result.data }
  if (result.data.targetDate) {
    updateData.targetDate = new Date(result.data.targetDate)
  }

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ data: updatedGoal })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const goal = await prisma.goal.findUnique({
    where: { id },
  })

  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  if (goal.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.goal.delete({
    where: { id },
  })

  return NextResponse.json({ data: { success: true } })
}
