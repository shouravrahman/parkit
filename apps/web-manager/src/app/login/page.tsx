import { LoginForm } from '@parkit/ui/src/components/templates/LoginForm'
import { AuthLayout } from '@parkit/ui/src/components/molecules/AuthLayout'
import { Suspense } from 'react'

export default function Page() {
  return (
    <AuthLayout title={'Login'}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
