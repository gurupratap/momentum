'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DeleteHabitButton({ habitId }: { habitId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete habit')
      }

      router.push('/dashboard')
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Are you sure?</span>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
          Delete
        </Button>
      </div>
    )
  }

  return (
    <Button variant="danger" onClick={() => setConfirming(true)}>
      Delete Habit
    </Button>
  )
}
