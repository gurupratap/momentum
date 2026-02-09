'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Habit, HabitStatus, FrequencyType, Goal } from '@/app/generated/prisma/client'
import { cn } from '@/lib/utils/cn'

interface HabitCardProps {
  habit: Habit & { goal?: Goal | null }
  showGoal?: boolean
}

const statusConfig: Record<HabitStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-100 text-red-700' },
}

const frequencyLabels: Record<FrequencyType, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  CUSTOM: 'Custom',
}

export function HabitCard({ habit, showGoal = false }: HabitCardProps) {
  const status = statusConfig[habit.status]
  const frequencyLabel = habit.frequency === 'CUSTOM' && habit.frequencyTarget
    ? `${habit.frequencyTarget}x per week`
    : frequencyLabels[habit.frequency]

  const description = habit.description || ''
  const truncatedDescription = description.length > 120
    ? description.slice(0, 120) + '...'
    : description

  return (
    <Link href={`/habits/${habit.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                {habit.name}
              </h3>
              {showGoal && habit.goal && (
                <p className="text-sm text-gray-500 mt-1">
                  Goal: {habit.goal.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {habit.isAiSuggested && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700" title="AI-suggested habit">
                  AI
                </span>
              )}
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                status.className
              )}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{frequencyLabel}</span>
          </div>

          {description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                {truncatedDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
