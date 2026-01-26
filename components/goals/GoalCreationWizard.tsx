'use client'

import { useReducer, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PurposeInput } from './PurposeInput'
import type { WizardState, WizardAction, WizardStep, GoalFormData } from '@/types'
import type { FrequencyType } from '@/app/generated/prisma/client'
import { cn } from '@/lib/utils/cn'

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'purpose', label: 'Purpose' },
]

const STORAGE_KEY = 'goal-wizard-draft'

const initialState: WizardState = {
  currentStep: 'details',
  data: {
    frequency: 'DAILY' as FrequencyType,
    startDate: new Date(),
  },
  errors: {},
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
    case 'NEXT_STEP': {
      const currentIndex = STEPS.findIndex((s) => s.id === state.currentStep)
      if (currentIndex < STEPS.length - 1) {
        return { ...state, currentStep: STEPS[currentIndex + 1].id }
      }
      return state
    }
    case 'PREV_STEP': {
      const currentIndex = STEPS.findIndex((s) => s.id === state.currentStep)
      if (currentIndex > 0) {
        return { ...state, currentStep: STEPS[currentIndex - 1].id }
      }
      return state
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

function loadDraft(): Partial<GoalFormData> | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.startDate) parsed.startDate = new Date(parsed.startDate)
      if (parsed.endDate) parsed.endDate = new Date(parsed.endDate)
      return parsed
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

function saveDraft(data: Partial<GoalFormData>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function GoalCreationWizard() {
  const router = useRouter()
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      Object.entries(draft).forEach(([key, value]) => {
        dispatch({ type: 'SET_FIELD', field: key as keyof GoalFormData, value })
      })
    }
  }, [])

  // Save draft on data change
  useEffect(() => {
    saveDraft(state.data)
  }, [state.data])

  const currentStepIndex = STEPS.findIndex((s) => s.id === state.currentStep)

  const validateStep = (): boolean => {
    const errors: Partial<Record<keyof GoalFormData, string>> = {}

    switch (state.currentStep) {
      case 'details':
        if (!state.data.title?.trim()) {
          errors.title = 'Title is required'
        } else if (state.data.title.length > 100) {
          errors.title = 'Title must be 100 characters or less'
        }
        if (state.data.description && state.data.description.length > 500) {
          errors.description = 'Description must be 500 characters or less'
        }
        break
      case 'frequency':
        if (!state.data.frequency) {
          errors.frequency = 'Please select a frequency'
        }
        if (state.data.frequency === 'CUSTOM' && !state.data.frequencyTarget) {
          errors.frequencyTarget = 'Please specify how many days per week'
        }
        break
      case 'timeline':
        if (state.data.endDate && state.data.startDate && state.data.endDate < state.data.startDate) {
          errors.endDate = 'End date must be after start date'
        }
        break
      case 'purpose':
        if (!state.data.purpose?.trim()) {
          errors.purpose = 'Purpose is required'
        } else if (state.data.purpose.length < 20) {
          errors.purpose = 'Purpose must be at least 20 characters'
        }
        break
    }

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      dispatch({ type: 'NEXT_STEP' })
    }
  }

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' })
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create goal')
      }

      clearDraft()
      router.push('/dashboard')
    } catch (error) {
      dispatch({
        type: 'SET_ERRORS',
        errors: { title: error instanceof Error ? error.message : 'Something went wrong' },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const setField = (field: keyof GoalFormData, value: unknown) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <nav className="mb-8">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    index < currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  'mt-2 text-xs font-medium',
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-full h-0.5 mx-2',
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                  style={{ width: '60px' }}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {state.currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  What&apos;s your goal?
                </h2>
                <p className="text-gray-600">
                  Give your goal a clear, actionable title.
                </p>
              </div>
              <Input
                label="Goal Title"
                placeholder="e.g., Exercise for 30 minutes"
                value={state.data.title || ''}
                onChange={(e) => setField('title', e.target.value)}
                error={state.errors.title}
                maxLength={100}
              />
              <Textarea
                label="Description (optional)"
                placeholder="Add any additional details about your goal..."
                value={state.data.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                error={state.errors.description}
                maxLength={500}
                showCharCount
                rows={3}
              />
            </div>
          )}

          {state.currentStep === 'frequency' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  How often?
                </h2>
                <p className="text-gray-600">
                  Choose how frequently you want to work on this goal.
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  { value: 'DAILY', label: 'Daily', desc: 'Every day' },
                  { value: 'WEEKLY', label: 'Weekly', desc: 'Once a week' },
                  { value: 'CUSTOM', label: 'Custom', desc: 'Choose specific days' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField('frequency', option.value as FrequencyType)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-colors',
                      state.data.frequency === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </button>
                ))}
              </div>
              {state.data.frequency === 'CUSTOM' && (
                <Input
                  label="Days per week"
                  type="number"
                  min={1}
                  max={7}
                  value={state.data.frequencyTarget || ''}
                  onChange={(e) => setField('frequencyTarget', parseInt(e.target.value) || undefined)}
                  error={state.errors.frequencyTarget}
                />
              )}
            </div>
          )}

          {state.currentStep === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  When do you want to start?
                </h2>
                <p className="text-gray-600">
                  Set a start date and optionally an end date for your goal.
                </p>
              </div>
              <Input
                label="Start Date"
                type="date"
                value={state.data.startDate ? state.data.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setField('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                error={state.errors.startDate}
              />
              <Input
                label="End Date (optional)"
                type="date"
                value={state.data.endDate ? state.data.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setField('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                error={state.errors.endDate}
                helperText="Leave blank for ongoing goals"
              />
            </div>
          )}

          {state.currentStep === 'purpose' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Why does this matter?
                </h2>
                <p className="text-gray-600">
                  Connecting with your deeper purpose will help you stay motivated.
                </p>
              </div>
              <PurposeInput
                value={state.data.purpose || ''}
                onChange={(value) => setField('purpose', value)}
                error={state.errors.purpose}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              Back
            </Button>
            {currentStepIndex === STEPS.length - 1 ? (
              <Button onClick={handleSubmit} loading={isSubmitting}>
                Create Goal
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
