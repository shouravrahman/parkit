import { ReactNode } from 'react'

export interface IBrandIconProps {
  children?: ReactNode
}

export const BrandIcon = ({
  children,
}: IBrandIconProps) => {
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className="absolute inset-0 bg-primary/10 rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-500" />
      <div className="relative flex items-center justify-center w-6 h-6 border-2 border-primary rounded-full overflow-hidden">
        <div className="w-2 h-4 bg-primary animate-park-car" />
        {children}
      </div>
    </div>
  )
}
