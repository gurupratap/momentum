'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestionCard } from './QuestionCard'

type QuestionOption = { key: string; text: string }

type Question = {
  id: string
  order: number
  questionText: string
  options: QuestionOption[]
  selectedOption: string | null
}

type InsightData = {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  research: string | null
  errorMessage: string | null
  questions: Question[]
}

interface HabitInsightSectionProps {
  habitId: string
}

export function HabitInsightSection({ habitId }: HabitInsightSectionProps) {
  const [insight, setInsight] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [retrying, setRetrying] = useState(false)

  const fetchInsight = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/${habitId}/insight`)
      if (res.ok) {
        const { data } = await res.json()
        setInsight(data)

        if (data.questions) {
          const firstUnanswered = data.questions.findIndex(
            (q: Question) => q.selectedOption === null
          )
          setCurrentQuestionIndex(
            firstUnanswered === -1 ? data.questions.length : firstUnanswered
          )
        }
      }
    } catch {
      // Silent fail — will retry on next poll
    } finally {
      setLoading(false)
    }
  }, [habitId])

  useEffect(() => {
    fetchInsight()
  }, [fetchInsight])

  // Poll while PENDING or PROCESSING
  useEffect(() => {
    if (!insight || (insight.status !== 'PENDING' && insight.status !== 'PROCESSING')) return

    const interval = setInterval(fetchInsight, 3000)
    return () => clearInterval(interval)
  }, [insight, fetchInsight])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const res = await fetch(`/api/habits/${habitId}/insight/retry`, { method: 'POST' })
      if (res.ok) {
        setInsight((prev) =>
          prev ? { ...prev, status: 'PENDING', errorMessage: null } : prev
        )
      }
    } catch {
      // Silent
    } finally {
      setRetrying(false)
    }
  }

  const handleAnswer = async (questionId: string, selectedOption: string) => {
    const res = await fetch(
      `/api/habits/${habitId}/questions/${questionId}/answer`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOption }),
      }
    )

    if (res.ok) {
      setInsight((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? { ...q, selectedOption } : q
          ),
        }
      })
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insight) return null

  // PENDING / PROCESSING
  if (insight.status === 'PENDING' || insight.status === 'PROCESSING') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600 font-medium">Analyzing your habit...</p>
          <p className="text-sm text-gray-400 mt-1">
            Our AI is researching common challenges and preparing personalized questions.
          </p>
        </CardContent>
      </Card>
    )
  }

  // FAILED
  if (insight.status === 'FAILED') {
    return (
      <Card className="border-red-200">
        <CardContent className="py-6 text-center">
          <p className="text-red-600 font-medium">Analysis failed</p>
          <p className="text-sm text-gray-500 mt-1">
            {insight.errorMessage || 'Something went wrong during analysis.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleRetry}
            loading={retrying}
          >
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  // COMPLETED
  const allAnswered = currentQuestionIndex >= insight.questions.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
            {insight.research}
          </p>
        </CardContent>
      </Card>

      {!allAnswered && (
        <Card>
          <CardHeader>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {insight.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionCard
              question={insight.questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
            />
          </CardContent>
        </Card>
      )}

      {allAnswered && insight.questions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <p className="text-green-700 font-medium">All questions answered!</p>
            <p className="text-sm text-green-600 mt-1">
              Your responses will help personalize your habit-building journey.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
