import { IconRotateClockwise2 } from '@tabler/icons-react'

type ButtonSizes = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export type IButtonProps = {
  size?: ButtonSizes
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'success' | 'error' | 'white' | 'black'
  fullWidth?: boolean
  loading?: boolean
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

const variantColor = {
  contained: {
    primary:
      'text-black font-semibold bg-gradient-to-r from-primary-400 to-primary border-0 shadow-lg shadow-primary/20 enabled:hover:from-primary-300 enabled:hover:to-primary-400 enabled:hover:shadow-primary/40',
    white: 'text-dark bg-white enabled:hover:bg-gray-50',
    black:
      'text-white bg-dark-100 border border-white/10 enabled:hover:bg-dark-200',
    success:
      'text-white bg-green enabled:hover:bg-green-700 shadow-lg shadow-green/20',
    error: 'text-white bg-red enabled:hover:bg-red-700 shadow-lg shadow-red/20',
  },

  outlined: {
    primary:
      'border border-primary/60 text-primary bg-primary/5 backdrop-blur-sm enabled:hover:bg-primary/10 enabled:hover:border-primary',
    white:
      'border border-white/20 text-white bg-white/5 backdrop-blur-sm enabled:hover:bg-white/10 enabled:hover:border-white/40',
    black:
      'border border-dark-300 text-gray-200 bg-white/5 backdrop-blur-sm enabled:hover:bg-white/10',
    success:
      'border border-green/60 text-green bg-green/5 enabled:hover:bg-green/10',
    error: 'border border-red/60 text-red bg-red/5 enabled:hover:bg-red/10',
  },
  text: {
    primary:
      'text-primary hover:text-primary-400 underline-offset-4 hover:underline',
    white: 'text-white hover:text-gray-200 underline-offset-4 hover:underline',
    black: 'text-gray-200 hover:text-white underline-offset-4 hover:underline',
    success:
      'text-green hover:text-green-300 underline-offset-4 hover:underline',
    error: 'text-red hover:text-red-400 underline-offset-4 hover:underline',
  },
}

const sizes: { [key in ButtonSizes]: string } = {
  none: 'text-xs',
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-8 py-3.5 text-base',
}

export const Button = ({
  size = 'md',
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  children,
  className,
  loading = false,
  type = 'button',
  ...props
}: IButtonProps) => {
  const variantCls = variantColor[variant][color]
  const sizeCls = sizes[size]

  const fwCls = fullWidth && 'w-full'
  const disCls = (disabled || loading) && 'opacity-50 cursor-not-allowed'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`relative rounded-lg font-medium transition-all duration-200 ${sizeCls} ${fwCls} ${variantCls} ${disCls} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <IconRotateClockwise2 className="w-4 h-4 animate-spin" />
          </div>
          <div className="opacity-10">{children}</div>
        </>
      ) : (
        <>{children}</>
      )}
    </button>
  )
}
