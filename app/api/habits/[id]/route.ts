import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { updateHabitSchema } from '@/lib/validations/habit'

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

  return NextResponse.json({ data: habit })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const result = updateHabitSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors).flat()[0] || 'Validation failed'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const existing = await prisma.habit.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  const habit = await prisma.habit.update({
    where: { id },
    data: result.data,
  })

  return NextResponse.json({ data: habit })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.habit.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  await prisma.habit.delete({ where: { id } })

  return NextResponse.json({ data: { success: true } })
}
