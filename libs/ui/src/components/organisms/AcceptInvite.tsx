'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoaderPanel } from '../molecules/Loader'
import { AlertSection } from '../molecules/AlertSection'
import { Button } from '../atoms/Button'

export const AcceptInvite = () => {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${window.location.href}`)
    }
  }, [status, router])

  const handleAccept = async () => {
    if (!token || !session?.user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          uid: session.user.uid,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to accept invitation.')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoaderPanel text="Processing invitation..." />
  }

  if (!token) {
    return (
      <AlertSection>
        <div>Invalid invitation link. Missing token.</div>
      </AlertSection>
    )
  }

  if (success) {
    return (
      <AlertSection>
        <div className="text-green-600 font-semibold text-lg">Invitation accepted!</div>
        <div className="text-sm text-gray-500">Redirecting to your dashboard...</div>
      </AlertSection>
    )
  }

  return (
    <AlertSection>
      <div className="text-lg font-semibold mb-2">You&apos;ve been invited!</div>
      <p className="text-sm text-gray-500 mb-6">
        Click the button below to join the company and start your journey with Parkit.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}
      <Button onClick={handleAccept} className="w-full">
        Accept Invitation
      </Button>
    </AlertSection>
  )
}
