import { AdminsQuery } from '@parkit/network/src/gql/generated'
import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

type AdminCardProps = {
  admin: AdminsQuery['admins'][number]
  children?: ReactNode
}

export const AdminCard = ({ admin, children }: AdminCardProps) => {
  const session = useSession()
  const uid = session.data?.user?.uid
  return (
    <div className="bg-dark-100 border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-base font-semibold text-white">
          {admin.user?.name || 'Unknown'}
        </h2>
        {uid === admin.uid ? (
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
            You
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-500 font-mono truncate">{admin.uid}</p>
      <p className="text-xs text-gray-500 mt-1">
        Since {format(new Date(admin.createdAt), 'PP')}
      </p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">
          {admin.verificationsCount}
        </span>
        <span className="text-xs text-gray-500">verifications</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
