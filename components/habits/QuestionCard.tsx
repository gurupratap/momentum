'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

type QuestionOption = { key: string; text: string }

interface QuestionCardProps {
  question: {
    id: string
    questionText: string
    options: QuestionOption[]
  }
  onAnswer: (questionId: string, selectedOption: string) => Promise<void>
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await onAnswer(question.id, selected)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-gray-900 font-medium mb-4">{question.questionText}</p>
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelected(option.key)}
            className={cn(
              'w-full p-3 rounded-lg border-2 text-left transition-colors text-sm',
              selected === option.key
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <span className="font-medium text-gray-500 mr-2">{option.key}.</span>
            <span className="text-gray-900">{option.text}</span>
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selected}
          loading={submitting}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
