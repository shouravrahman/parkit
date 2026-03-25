'use client'
import { Role } from '@parkit/util/types'
import { useFormRegister } from '@parkit/forms/src/register'
import { useMutation } from '@apollo/client'
import { RegisterWithCredentialsDocument } from '@parkit/network/src/gql/generated'
import { Form } from '../atoms/Form'
import { signIn } from 'next-auth/react'
import { HtmlLabel } from '../atoms/HtmlLabel'
import { HtmlInput } from '../atoms/HtmlInput'
import { Button } from '../atoms/Button'
import Link from 'next/link'

export interface ISignupFormProps {
  className?: string
  role?: Role
}
export const RegisterForm = ({ className, role }: ISignupFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormRegister()

  const [registerWithCredentials, { loading, data }] = useMutation(
    RegisterWithCredentialsDocument,
  )

  return (
    <Form
      onSubmit={handleSubmit(async (formData) => {
        const { data, errors } = await registerWithCredentials({
          variables: {
            registerWithCredentialsInput: formData,
          },
        })

        if (errors) {
          alert(errors)
        }

        if (data) {
          alert(`User ${data.registerWithCredentials.uid} created. 🎉`)
          signIn('credentials', {
            email: formData.email,
            password: formData.password,
            callbackUrl: '/',
          })
        }
      })}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Create account</h2>
        <p className="text-sm text-gray-500 mt-1">Join ParkIt to get started</p>
      </div>
      <HtmlLabel title="Email" error={errors.email?.message}>
        <HtmlInput placeholder="you@example.com" {...register('email')} />
      </HtmlLabel>
      <HtmlLabel title="Password" error={errors.password?.message}>
        <HtmlInput
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
      </HtmlLabel>
      <HtmlLabel title="Display name" error={errors.name?.message}>
        <HtmlInput placeholder="Your name" {...register('name')} />
      </HtmlLabel>
      {Object.keys(errors).length ? (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
          Please fix the above {Object.keys(errors).length} error
          {Object.keys(errors).length > 1 ? 's' : ''}
        </div>
      ) : null}
      <Button type="submit" fullWidth loading={loading}>
        Create account
      </Button>
      <div className="mt-5 text-sm text-gray-500 text-center">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
        >
          Sign in
        </Link>
      </div>
    </Form>
  )
}
