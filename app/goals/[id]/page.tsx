import Link from 'next/link'
import { notFound } from 'next/navigation'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoalInsightSection } from '@/components/goals/GoalInsightSection'
import { HabitCard } from '@/components/habits/HabitCard'
import { Button } from '@/components/ui/button'

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
  ACHIEVED: { label: 'Achieved', className: 'bg-blue-100 text-blue-700' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-100 text-red-700' },
}

const categoryIcons: Record<string, string> = {
  HEALTH: '❤️',
  FITNESS: '💪',
  PRODUCTIVITY: '⚡',
  LEARNING: '📚',
  MINDFULNESS: '🧘',
  RELATIONSHIPS: '👥',
  CAREER: '💼',
  FINANCE: '💰',
  PERSONAL: '🌟',
  OTHER: '📌',
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await stackServerApp.getUser()
  if (!user) return null

  const { id } = await params

  const goal = await prisma.goal.findFirst({
    where: { id, userId: user.id },
    include: {
      habits: {
        orderBy: { createdAt: 'desc' },
      },
      insight: true,
    },
  })

  if (!goal) {
    notFound()
  }

  const status = statusLabels[goal.status]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {goal.category && (
              <span className="text-3xl">{categoryIcons[goal.category]}</span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
              {goal.targetDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-6">
          {goal.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{goal.description}</p>
              </CardContent>
            </Card>
          )}

          {goal.habits.length > 0 ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Habits ({goal.habits.length})
                  </h2>
                  <Link href={`/goals/${goal.id}/add-habit`}>
                    <Button variant="outline" size="sm">
                      Add Custom Habit
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {goal.habits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              </div>

              <GoalInsightSection goalId={goal.id} initialInsight={goal.insight} hasHabits={true} />
            </>
          ) : (
            <GoalInsightSection goalId={goal.id} initialInsight={goal.insight} hasHabits={false} />
          )}
        </div>
      </div>
    </div>
  )
}
