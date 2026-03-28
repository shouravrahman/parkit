'use client'
import { AddValet } from '../organisms/AddValet'
import { InviteUser } from '../organisms/InviteUser'
import { ListValets } from '../organisms/ListValets'

export const ManageValets = () => {
  return (
    <div>
      <div className="flex justify-end gap-2">
        <AddValet />
        <InviteUser />
      </div>
      <ListValets />
    </div>
  )
}
