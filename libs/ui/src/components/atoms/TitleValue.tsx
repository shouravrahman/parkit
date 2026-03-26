import { ReactNode } from 'react'

export const TitleValue = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <div>
    <strong className="font-semibold">{title}</strong>{' '}
    <div className="text-sm">{children}</div>
  </div>
)

export const TitleStrongValue = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <div>
    <div className="text-xs text-gray-500">{title}</div>
    <div className="text-white">{children}</div>{' '}
  </div>
)
