import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewHabitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Start with a Goal
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To build lasting habits, start by setting a goal. Our AI will suggest specific, actionable habits to help you achieve it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/goals/new">
                <Button className="w-full sm:w-auto">
                  Create a Goal
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
