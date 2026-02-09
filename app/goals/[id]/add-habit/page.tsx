import Link from 'next/link'
import { notFound } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { HabitForm } from '@/components/habits/HabitForm'

export default async function AddHabitToGoalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await stackServerApp.getUser()
  if (!user) return null

  const { id: goalId } = await params

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  })

  if (!goal) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/goals/${goalId}`}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Goal
          </Link>
        </div>

        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">
            Adding habit to: <span className="font-medium text-gray-900">{goal.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add a Custom Habit</h1>
          <p className="text-gray-600 mt-1">
            Create a habit that will help you achieve your goal.
          </p>
        </div>

        <HabitForm goalId={goalId} />
      </div>
    </div>
  )
}
