'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { GoalFormData, GoalCategory } from '@/types'
import { cn } from '@/lib/utils/cn'

const CATEGORY_OPTIONS: Array<{ value: GoalCategory; label: string; icon: string }> = [
  { value: 'HEALTH', label: 'Health', icon: '❤️' },
  { value: 'FITNESS', label: 'Fitness', icon: '💪' },
  { value: 'PRODUCTIVITY', label: 'Productivity', icon: '⚡' },
  { value: 'LEARNING', label: 'Learning', icon: '📚' },
  { value: 'MINDFULNESS', label: 'Mindfulness', icon: '🧘' },
  { value: 'RELATIONSHIPS', label: 'Relationships', icon: '👥' },
  { value: 'CAREER', label: 'Career', icon: '💼' },
  { value: 'FINANCE', label: 'Finance', icon: '💰' },
  { value: 'PERSONAL', label: 'Personal', icon: '🌟' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
]

export function GoalForm() {
  const router = useRouter()
  const [data, setData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: undefined,
    targetDate: undefined,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = <K extends keyof GoalFormData>(field: K, value: GoalFormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {}

    if (!data.title.trim()) {
      newErrors.title = 'Goal title is required'
    } else if (data.title.length > 200) {
      newErrors.title = 'Goal title must be 200 characters or less'
    }

    if (data.description && data.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
      }

      if (data.description?.trim()) {
        payload.description = data.description
      }

      if (data.category) {
        payload.category = data.category
      }

      if (data.targetDate) {
        payload.targetDate = new Date(data.targetDate).toISOString()
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create goal')
      }

      const result = await response.json()
      router.push(`/goals/${result.data.id}`)
    } catch (error) {
      setErrors({
        title: error instanceof Error ? error.message : 'Something went wrong',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <Input
            label="What do you want to achieve?"
            placeholder="e.g., Reduce stress and anxiety"
            value={data.title}
            onChange={(e) => setField('title', e.target.value)}
            error={errors.title}
            maxLength={200}
            required
          />

          <Textarea
            label="Additional details (optional)"
            placeholder="e.g., I've been feeling overwhelmed lately and want to develop better coping mechanisms..."
            value={data.description}
            onChange={(e) => setField('description', e.target.value)}
            error={errors.description}
            maxLength={1000}
            showCharCount
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category (optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setField('category', option.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-colors',
                    data.category === option.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Target date (optional)"
            type="date"
            value={data.targetDate || ''}
            onChange={(e) => setField('targetDate', e.target.value)}
            error={errors.targetDate}
          />

          <div className="pt-2">
            <Button type="submit" loading={isSubmitting} className="w-full">
              Create Goal & Get AI Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
