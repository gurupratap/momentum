'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Goal, GoalStatus, GoalCategory } from '@/app/generated/prisma/client'
import { cn } from '@/lib/utils/cn'

interface GoalCardProps {
  goal: Goal & { _count: { habits: number } }
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
  ACHIEVED: { label: 'Achieved', className: 'bg-blue-100 text-blue-700' },
  ABANDONED: { label: 'Abandoned', className: 'bg-red-100 text-red-700' },
}

const categoryIcons: Record<GoalCategory, string> = {
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

export function GoalCard({ goal }: GoalCardProps) {
  const status = statusConfig[goal.status]
  const habitCount = goal._count.habits

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {goal.category && (
                  <span className="text-2xl">{categoryIcons[goal.category]}</span>
                )}
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                  {goal.title}
                </h3>
              </div>
            </div>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2',
              status.className
            )}>
              {status.label}
            </span>
          </div>

          {goal.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {goal.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {habitCount === 0 ? 'No habits yet' : `${habitCount} habit${habitCount === 1 ? '' : 's'}`}
              </span>
            </div>

            {goal.targetDate && (
              <div className="text-gray-500 text-xs">
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
