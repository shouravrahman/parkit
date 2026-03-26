'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '../../atoms/Button'
import { Dialog } from '../../atoms/Dialog'
import { useFormUid } from '@parkit/forms/src/createUid'
import { Form } from '../../atoms/Form'
import { HtmlLabel } from '../../atoms/HtmlLabel'
import { HtmlInput } from '../../atoms/HtmlInput'
import { useMutation } from '@apollo/client'
import {
  CreateAdminDocument,
  namedOperations,
} from '@parkit/network/src/gql/generated'

export const CreateAdmin = () => {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { register, handleSubmit, setValue } = useFormUid()

  const [createAdmin, { loading }] = useMutation(CreateAdminDocument, {
    awaitRefetchQueries: true,
    refetchQueries: [namedOperations.Query.admins],
  })

  const handleOpen = () => {
    // Pre-fill with the logged-in user's uid
    if (session?.user?.uid) {
      setValue('uid', session.user.uid)
    }
    setOpen(true)
  }

  return (
    <>
      <Button onClick={handleOpen}>Create admin</Button>
      <Dialog open={open} setOpen={setOpen} title="Create admin">
        <Form
          onSubmit={handleSubmit(async ({ uid }) => {
            await createAdmin({ variables: { createAdminInput: { uid } } })
            setOpen(false)
          })}
        >
          <HtmlLabel title="uid">
            <HtmlInput placeholder="uid" {...register('uid')} />
          </HtmlLabel>
          {session?.user?.uid && (
            <p className="text-xs text-gray-400 mt-1">
              Your uid:{' '}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => setValue('uid', session.user.uid)}
              >
                {session.user.uid}
              </button>
            </p>
          )}
          <Button loading={loading} type="submit" className="mt-3">
            Create
          </Button>
        </Form>
      </Dialog>
    </>
  )
}
