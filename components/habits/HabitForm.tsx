'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { HabitFormData } from '@/types'
import type { FrequencyType } from '@/app/generated/prisma/client'
import { cn } from '@/lib/utils/cn'

const FREQUENCY_OPTIONS = [
  { value: 'DAILY' as FrequencyType, label: 'Daily', desc: 'Every day' },
  { value: 'WEEKLY' as FrequencyType, label: 'Weekly', desc: 'Once a week' },
  { value: 'CUSTOM' as FrequencyType, label: 'Custom', desc: 'Choose specific days' },
]

interface HabitFormProps {
  goalId: string
}

export function HabitForm({ goalId }: HabitFormProps) {
  const router = useRouter()
  const [data, setData] = useState<HabitFormData>({
    goalId,
    name: '',
    description: '',
    frequency: 'DAILY',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof HabitFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = <K extends keyof HabitFormData>(field: K, value: HabitFormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof HabitFormData, string>> = {}

    if (!data.name.trim()) {
      newErrors.name = 'Habit name is required'
    } else if (data.name.length > 100) {
      newErrors.name = 'Habit name must be 100 characters or less'
    }

    if (data.description && data.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (data.frequency === 'CUSTOM' && !data.frequencyTarget) {
      newErrors.frequencyTarget = 'Please specify how many days per week'
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
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create habit')
      }

      router.push(`/goals/${goalId}`)
    } catch (error) {
      setErrors({
        name: error instanceof Error ? error.message : 'Something went wrong',
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
            label="Habit"
            placeholder="e.g., Meditate for 10 minutes"
            value={data.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            maxLength={100}
          />

          <Textarea
            label="Description (optional)"
            placeholder="e.g., This will help me build mindfulness and reduce stress"
            value={data.description}
            onChange={(e) => setField('description', e.target.value)}
            error={errors.description}
            maxLength={500}
            showCharCount
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <div className="grid gap-3">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setField('frequency', option.value)}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 text-left transition-colors',
                    data.frequency === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.desc}</p>
                </button>
              ))}
            </div>
            {data.frequency === 'CUSTOM' && (
              <div className="mt-3">
                <Input
                  label="Days per week"
                  type="number"
                  min={1}
                  max={7}
                  value={data.frequencyTarget || ''}
                  onChange={(e) => setField('frequencyTarget', parseInt(e.target.value) || undefined)}
                  error={errors.frequencyTarget}
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" loading={isSubmitting} className="w-full">
              Add Habit
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
