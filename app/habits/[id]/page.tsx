import Link from 'next/link'
import { notFound } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitInsightSection } from '@/components/habits/HabitInsightSection'
import { DeleteHabitButton } from './DeleteHabitButton'

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-100 text-red-700' },
}

const frequencyLabels: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  CUSTOM: 'Custom',
}

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await stackServerApp.getUser()
  if (!user) return null

  const { id } = await params

  const habit = await prisma.habit.findFirst({
    where: { id, userId: user.id },
    include: {
      goal: true,
    },
  })

  if (!habit) {
    notFound()
  }

  const status = statusLabels[habit.status]
  const frequencyLabel = habit.frequency === 'CUSTOM' && habit.frequencyTarget
    ? `${habit.frequencyTarget}x per week`
    : frequencyLabels[habit.frequency]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 space-y-2">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          {habit.goal && (
            <div className="text-sm text-gray-600">
              Goal: <Link href={`/goals/${habit.goal.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                {habit.goal.title}
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{habit.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="grid gap-6">
          {habit.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{habit.description}</p>
              </CardContent>
            </Card>
          )}

          {habit.isAiSuggested && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-indigo-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <span className="font-medium">AI-suggested habit</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                  <dd className="text-gray-900">{frequencyLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Started</dt>
                  <dd className="text-gray-900">
                    {new Date(habit.startDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <HabitInsightSection habitId={habit.id} />

          <div className="flex justify-end gap-3">
            <DeleteHabitButton habitId={habit.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
