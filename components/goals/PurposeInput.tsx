'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'

const PROMPTS = [
  "Why does this goal matter to you?",
  "What will achieving this goal make possible?",
  "How will you feel when you accomplish this?",
  "What's driving you to pursue this goal now?",
  "Who will benefit when you achieve this goal?",
]

const HELPER_PROMPTS = [
  "Think about what sparked this goal...",
  "Consider how this connects to your values...",
  "Imagine your future self thanking you...",
  "What would you tell a friend about why this matters?",
]

interface PurposeInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function PurposeInput({ value, onChange, error }: PurposeInputProps) {
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [showHelpers, setShowHelpers] = useState(false)

  const charCount = value.length
  const minChars = 20
  const isValid = charCount >= minChars

  const cyclePrompt = () => {
    setActivePromptIndex((prev) => (prev + 1) % PROMPTS.length)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={cyclePrompt}
          className="text-left w-full group"
        >
          <p className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {PROMPTS[activePromptIndex]}
          </p>
          <p className="text-sm text-gray-500 group-hover:text-gray-600">
            Click to see another prompt
          </p>
        </button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Take a moment to reflect on your deeper motivation..."
        rows={5}
        maxLength={1000}
        showCharCount
        error={error}
        className={cn(
          'transition-all',
          isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500'
        )}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isValid && (
            <p className={cn(
              'text-sm',
              charCount > 0 ? 'text-amber-600' : 'text-gray-500'
            )}>
              {minChars - charCount} more characters needed
            </p>
          )}
          {isValid && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looking good!
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowHelpers(!showHelpers)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showHelpers ? 'Hide tips' : 'Help me write this'}
        </button>
      </div>

      {showHelpers && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-blue-900">Try thinking about:</p>
          <ul className="space-y-1">
            {HELPER_PROMPTS.map((prompt, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
