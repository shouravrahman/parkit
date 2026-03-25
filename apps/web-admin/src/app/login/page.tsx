import { LoginForm } from '@parkit/ui/src/components/templates/LoginForm'
import { AuthLayout } from '@parkit/ui/src/components/molecules/AuthLayout'

export default function Page() {
  return (
    <AuthLayout title={'Login'}>
      <LoginForm />
    </AuthLayout>
  )
}
