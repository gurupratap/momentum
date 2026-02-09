'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HabitSuggestionList } from './HabitSuggestionList'
import type { GoalInsight } from '@/app/generated/prisma/client'
import type { SuggestedHabit } from '@/types'
import { cn } from '@/lib/utils/cn'

interface GoalInsightSectionProps {
  goalId: string
  initialInsight: GoalInsight | null
  hasHabits?: boolean
}

type GoalInsightWithSuggestions = GoalInsight & {
  suggestions: SuggestedHabit[] | null
}

export function GoalInsightSection({ goalId, initialInsight, hasHabits = false }: GoalInsightSectionProps) {
  const [insight, setInsight] = useState<GoalInsightWithSuggestions | null>(
    initialInsight as GoalInsightWithSuggestions | null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(!hasHabits)
  const [showSuggestions, setShowSuggestions] = useState(!hasHabits)

  const fetchInsight = useCallback(async () => {
    try {
      const response = await fetch(`/api/goals/${goalId}/insight`)
      if (!response.ok) throw new Error('Failed to fetch insight')

      const data = await response.json()
      setInsight(data.data)
    } catch (error) {
      console.error('Error fetching insight:', error)
    }
  }, [goalId])

  useEffect(() => {
    // If no initial insight, fetch it
    if (!insight) {
      setIsLoading(true)
      fetchInsight().finally(() => setIsLoading(false))
      return
    }

    // Only poll if status is PENDING or PROCESSING
    if (insight.status === 'PENDING' || insight.status === 'PROCESSING') {
      const interval = setInterval(() => {
        fetchInsight()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [insight, fetchInsight])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const response = await fetch(`/api/goals/${goalId}/insight/retry`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to retry analysis')

      const data = await response.json()
      setInsight(data.data)
    } catch (error) {
      console.error('Error retrying analysis:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insight) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          <p>No analysis available</p>
        </CardContent>
      </Card>
    )
  }

  // Processing state
  if (insight.status === 'PENDING' || insight.status === 'PROCESSING') {
    return (
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <div>
              <p className="font-medium text-indigo-900">Analyzing your goal...</p>
              <p className="text-sm text-indigo-700 mt-1">
                Our AI is breaking down your goal into actionable habits. This usually takes 10-30 seconds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Failed state
  if (insight.status === 'FAILED') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-900">Analysis Failed</p>
              <p className="text-sm text-red-700 mt-1">
                {insight.errorMessage || 'Something went wrong while analyzing your goal.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                loading={isRetrying}
                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Completed state
  const suggestions = insight.suggestions as unknown as SuggestedHabit[] | null

  // If no habits yet, show everything expanded (initial state)
  if (!hasHabits) {
    return (
      <div className="space-y-6">
        {insight.analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{insight.analysis}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions && suggestions.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <HabitSuggestionList goalId={goalId} suggestions={suggestions} />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // If habits exist, show as collapsible sections
  return (
    <div className="space-y-4">
      {insight.analysis && (
        <Card className="border-gray-200">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full text-left"
          >
            <CardHeader className="hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  AI Analysis
                </CardTitle>
                <svg
                  className={cn(
                    'w-5 h-5 text-gray-400 transition-transform',
                    showAnalysis && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </CardHeader>
          </button>
          {showAnalysis && (
            <CardContent className="pt-0">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{insight.analysis}</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {suggestions && suggestions.length > 0 && (
        <Card className="border-gray-200">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full text-left"
          >
            <CardHeader className="hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  More Habit Suggestions ({suggestions.length})
                </CardTitle>
                <svg
                  className={cn(
                    'w-5 h-5 text-gray-400 transition-transform',
                    showSuggestions && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </CardHeader>
          </button>
          {showSuggestions && (
            <CardContent className="pt-0">
              <HabitSuggestionList goalId={goalId} suggestions={suggestions} />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
