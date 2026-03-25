import { ReactNode } from 'react'

export interface IAlertSectionProps {
  title?: ReactNode
  children: ReactNode
}

export const AlertSection = ({ title, children }: IAlertSectionProps) => {
  return (
    <div className="min-h-[calc(100vh-8rem)] mt-4">
      {title ? (
        <div className="mb-3 text-lg font-semibold text-white">{title}</div>
      ) : null}
      <div className="h-64 bg-dark-100 border border-white/10 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
          {children}
        </div>
      </div>
    </div>
  )
}
