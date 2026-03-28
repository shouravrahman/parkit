'use client'
import { AdminMeDocument } from '@parkit/network/src/gql/generated'
import { useQuery } from '@apollo/client'
import { LoaderPanel } from '../molecules/Loader'
import { AlertSection } from '../molecules/AlertSection'
import { ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const IsAdmin = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession()
  const { data, loading, error } = useQuery(AdminMeDocument, {
    fetchPolicy: 'cache-first',
    skip: status !== 'authenticated',
  })
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return <LoaderPanel text="Verifying admin status..." />
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (error) {
    return (
      <AlertSection title="Authorization Error">
        <div>{error.message}</div>
      </AlertSection>
    )
  }

  if (!data?.adminMe?.uid) {
    return (
      <AlertSection title="Access Denied">
        <div>You do not have administrative privileges.</div>
      </AlertSection>
    )
  }

  return <>{children}</>
}
