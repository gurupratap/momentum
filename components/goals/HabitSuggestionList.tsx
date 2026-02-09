'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HabitSuggestionCard } from './HabitSuggestionCard'
import type { SuggestedHabit } from '@/types'

interface HabitSuggestionListProps {
  goalId: string
  suggestions: SuggestedHabit[]
}

export function HabitSuggestionList({ goalId, suggestions }: HabitSuggestionListProps) {
  const router = useRouter()
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
    setError(null)
  }

  const handleAddSelected = async () => {
    if (selectedIndices.length === 0) {
      setError('Please select at least one habit')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/goals/${goalId}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionIndices: selectedIndices }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create habits')
      }

      // Redirect back to goal detail page
      router.push(`/goals/${goalId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    router.push(`/goals/${goalId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Suggested Habits
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select the habits you&rsquo;d like to build. Our AI will provide personalized coaching for each.
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {selectedIndices.length} selected
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <HabitSuggestionCard
            key={index}
            suggestion={suggestion}
            index={index}
            selected={selectedIndices.includes(index)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleAddSelected}
          loading={isSubmitting}
          disabled={selectedIndices.length === 0}
          className="flex-1"
        >
          Add {selectedIndices.length > 0 ? `${selectedIndices.length} ` : ''}Selected Habit{selectedIndices.length !== 1 ? 's' : ''}
        </Button>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isSubmitting}
        >
          Skip for Now
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You can always add more habits manually later
      </p>
    </div>
  )
}
