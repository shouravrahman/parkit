import { ReactNode } from 'react'

export interface IBadgeProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'gray' | 'red' | 'yellow' | 'green'
}

export const Badge = ({
  children,
  size = 'md',
  variant = 'gray',
}: IBadgeProps) => {
  const sizeCls = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }
  const variantCls = {
    primary:
      'bg-primary/15 border border-primary/30 text-primary-400 font-medium',
    gray: 'bg-white/8 border border-white/12 text-gray-300',
    red: 'bg-red/15 border border-red/30 text-red-400 font-medium',
    yellow:
      'bg-primary/15 border border-primary/30 text-primary-400 font-medium',
    green: 'bg-green/15 border border-green/30 text-green-400 font-medium',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 ${sizeCls[size]} ${variantCls[variant]}`}
    >
      {children}
    </span>
  )
}
