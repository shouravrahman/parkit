import { BaseComponent } from '@parkit/util/types'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export const UserInfo = ({ children, className }: BaseComponent) => {
  const session = useSession()
  const image = session.data?.user?.image
  const name = session.data?.user?.name
  const uid = session.data?.user?.uid
  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <Image
        src={image || '/user.png'}
        alt=""
        width={300}
        height={300}
        className="w-12 h-12 object-cover rounded-full border-2 border-primary/60 ring-2 ring-primary/20"
      />
      <div>
        <div className="font-semibold text-white leading-tight">{name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{uid}</div>
      </div>
      {children}
    </div>
  )
}
