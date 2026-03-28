'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../atoms/Button'
import { Dialog } from '../atoms/Dialog'
import { Form } from '../atoms/Form'
import { HtmlInput } from '../atoms/HtmlInput'
import { HtmlLabel } from '../atoms/HtmlLabel'
import { HtmlSelect } from '../atoms/HtmlSelect'
import { toast } from '../molecules/Toast'

export const InviteUser = ({
  companyId,
  role: initialRole,
}: {
  companyId?: number
  role?: 'MANAGER' | 'VALET'
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ email: string; role: 'MANAGER' | 'VALET' }>({
    defaultValues: {
      role: initialRole,
    },
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, companyId }),
      })

      if (response.ok) {
        toast('Invitation sent successfully! 📧')
        reset()
        setOpen(false)
      } else {
        const err = await response.json()
        toast(err.message || 'Failed to send invitation.')
      }
    } catch (error) {
      toast('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Invite User</Button>
      <Dialog
        widthClassName="max-w-md"
        open={open}
        setOpen={setOpen}
        title={'Invite New User'}
      >
        <Form onSubmit={onSubmit}>
          <HtmlLabel title="Email" error={errors.email?.message}>
            <HtmlInput
              type="email"
              placeholder="user@example.com"
              {...register('email', { required: 'Email is required' })}
            />
          </HtmlLabel>
          <HtmlLabel title="Role" error={errors.role?.message}>
            <HtmlSelect {...register('role', { required: 'Role is required' })}>
              <option value="VALET">Valet</option>
              <option value="MANAGER">Manager</option>
            </HtmlSelect>
          </HtmlLabel>
          <Button loading={loading} type="submit">
            Send Invitation
          </Button>
        </Form>
      </Dialog>
    </div>
  )
}
