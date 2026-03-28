'use client'
import { useFormLogin } from '@parkit/forms/src/login'
import { Form } from '../atoms/Form'
import { HtmlLabel } from '../atoms/HtmlLabel'
import { HtmlInput } from '../atoms/HtmlInput'
import { Button } from '../atoms/Button'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useSearchParams } from 'next/navigation'
import { toast } from '../molecules/Toast'

export interface ILoginFormProps {
  className?: string
}
export const LoginForm = ({ className }: ILoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormLogin()

  const { replace } = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [loading, setLoading] = useState(false)

  return (
    <Form
      onSubmit={handleSubmit(async (data) => {
        const { email, password } = data
        setLoading(true)

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        setLoading(false)

        if (result?.ok) {
          toast.success('Login successful!')
          replace(callbackUrl)
        }
        if (result?.error) {
          toast.error('Login failed. Please check your credentials.')
        }
      })}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign in to your ParkIt account
        </p>
      </div>
      <HtmlLabel title="Email" error={errors.email?.message}>
        <HtmlInput {...register('email')} placeholder="you@example.com" />
      </HtmlLabel>
      <HtmlLabel title="Password" error={errors.password?.message}>
        <HtmlInput
          type="password"
          {...register('password')}
          placeholder="••••••••"
        />
      </HtmlLabel>
      <Button type="submit" loading={loading}>
        Sign in
      </Button>
      <div className="mt-5 text-sm text-gray-500 text-center">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
        >
          Create one
        </Link>
      </div>
    </Form>
  )
}
