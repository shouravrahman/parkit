import { Switch as HUISwitch, SwitchGroup, Label } from '@headlessui/react'
import { ReactNode } from 'react'

export interface Switch2Props {
  label: ReactNode
  children?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export const Switch = ({
  label,
  children,
  checked,
  onChange,
  className,
}: Switch2Props) => {
  return (
    <SwitchGroup>
      <div className={`flex items-center gap-2 ${className}`}>
        <Label className="text-sm text-gray-300 cursor-pointer">{label}</Label>
        <HUISwitch
          checked={checked}
          onChange={onChange}
          className={`${
            checked
              ? 'bg-primary shadow-sm shadow-primary/40'
              : 'bg-dark-300 border border-white/10'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-dark`}
        >
          <span
            className={`${
              checked ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200`}
          >
            {children}
          </span>
        </HUISwitch>
      </div>
    </SwitchGroup>
  )
}
