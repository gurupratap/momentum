import Link from 'next/link'
import { stackServerApp } from '@/stack'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await stackServerApp.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Momentum
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.displayName || user?.primaryEmail}
              </span>
              <Link href="/handler/sign-out">
                <Button variant="ghost" size="sm">
                  Sign out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
