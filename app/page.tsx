import Link from 'next/link'
import { stackServerApp } from '@/stack'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await stackServerApp.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-gray-900">Momentum</span>
          <Link
            href="/handler/sign-in"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Achieve your goals with
            <span className="text-blue-600"> AI-powered habits</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
            Share your goals, and our AI will suggest specific, actionable habits
            to help you achieve them. Get personalized coaching every step of the way.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/handler/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/handler/sign-in"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
