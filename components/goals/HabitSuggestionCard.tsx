'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { SuggestedHabit } from '@/types'
import { cn } from '@/lib/utils/cn'

interface HabitSuggestionCardProps {
  suggestion: SuggestedHabit
  index: number
  selected: boolean
  onToggle: (index: number) => void
}

const impactColors = {
  high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  challenging: 'bg-red-100 text-red-700 border-red-200',
}

const frequencyLabels = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  CUSTOM: 'Custom',
}

export function HabitSuggestionCard({
  suggestion,
  index,
  selected,
  onToggle,
}: HabitSuggestionCardProps) {
  const [expanded, setExpanded] = useState(false)

  const frequencyLabel = suggestion.frequency === 'CUSTOM' && suggestion.frequencyTarget
    ? `${suggestion.frequencyTarget}x per week`
    : frequencyLabels[suggestion.frequency]

  return (
    <Card
      className={cn(
        'transition-all cursor-pointer',
        selected
          ? 'border-2 border-indigo-600 bg-indigo-50'
          : 'border-2 border-gray-200 hover:border-gray-300'
      )}
      onClick={() => onToggle(index)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                selected
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-gray-300'
              )}
            >
              {selected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-2">{suggestion.name}</h4>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={cn('px-2 py-1 rounded text-xs font-medium border', impactColors[suggestion.impact])}>
                {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)} Impact
              </span>
              <span className={cn('px-2 py-1 rounded text-xs font-medium border', difficultyColors[suggestion.difficulty])}>
                {suggestion.difficulty.charAt(0).toUpperCase() + suggestion.difficulty.slice(1)}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                {frequencyLabel}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>

            {suggestion.rationale && (
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(!expanded)
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  {expanded ? 'Hide' : 'Show'} why this helps
                  <svg
                    className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expanded && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">{suggestion.rationale}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
