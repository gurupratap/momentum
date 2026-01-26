'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Goal, GoalStatus, FrequencyType } from '@/app/generated/prisma/client'
import { cn } from '@/lib/utils/cn'

interface GoalCardProps {
  goal: Goal
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
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

export function GoalCard({ goal }: GoalCardProps) {
  const status = statusConfig[goal.status]
  const frequencyLabel = goal.frequency === 'CUSTOM' && goal.frequencyTarget
    ? `${goal.frequencyTarget}x per week`
    : frequencyLabels[goal.frequency]

  const truncatedPurpose = goal.purpose.length > 120
    ? goal.purpose.slice(0, 120) + '...'
    : goal.purpose

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
              {goal.title}
            </h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2',
              status.className
            )}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{frequencyLabel}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 italic">
              &ldquo;{truncatedPurpose}&rdquo;
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
