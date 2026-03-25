import { RegisterForm } from '@parkit/ui/src/components/templates/RegisterForm'
import { AuthLayout } from '@parkit/ui/src/components/molecules/AuthLayout'

export default function Page() {
  return (
    <AuthLayout title={'Register'}>
      <RegisterForm />
    </AuthLayout>
  )
}
