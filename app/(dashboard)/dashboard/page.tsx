import Link from 'next/link'
import { stackServerApp } from '@/stack'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { GoalCard } from '@/components/goals/GoalCard'

export default async function DashboardPage() {
  const user = await stackServerApp.getUser()
  if (!user) return null

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { habits: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Goals</h1>
          <p className="text-gray-600 mt-1">
            {goals.length === 0
              ? 'Start your journey by setting your first goal.'
              : `You have ${goals.length} goal${goals.length === 1 ? '' : 's'}.`}
          </p>
        </div>
        <Link href="/goals/new">
          <Button>Create Goal</Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No goals yet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Set a goal and let AI suggest specific, actionable habits to help you achieve it.
          </p>
          <div className="mt-6">
            <Link href="/goals/new">
              <Button>Create your first goal</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
