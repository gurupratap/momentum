import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

type RouteParams = { params: Promise<{ id: string; questionId: string }> }

const answerSchema = z.object({
  selectedOption: z.string().min(1, 'An option must be selected'),
})

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await stackServerApp.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, questionId } = await params

  const habit = await prisma.habit.findFirst({
    where: { id, userId: user.id },
  })

  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  const body = await request.json()
  const result = answerSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid answer' }, { status: 400 })
  }

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      insight: { habitId: id },
    },
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  // Validate that the selected option key exists in the question's options
  const options = question.options as Array<{ key: string; text: string }>
  const validKeys = options.map((o) => o.key)
  if (!validKeys.includes(result.data.selectedOption)) {
    return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 })
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { selectedOption: result.data.selectedOption },
  })

  return NextResponse.json({ data: updated })
}
