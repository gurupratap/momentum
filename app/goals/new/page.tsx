import Link from 'next/link'
import { GoalForm } from '@/components/goals/GoalForm'

export default function NewGoalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create a Goal</h1>
          <p className="text-gray-600 mt-1">
            Tell us what you want to achieve, and we&rsquo;ll suggest habits to help you get there.
          </p>
        </div>

        <GoalForm />
      </div>
    </div>
  )
}
