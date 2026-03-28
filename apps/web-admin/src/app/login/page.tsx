'use client'
import { LoginForm } from '@parkit/ui/src/components/templates/LoginForm'
import { AuthLayout } from '@parkit/ui/src/components/molecules/AuthLayout'
import { Suspense, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <AuthLayout title={'Login'}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
