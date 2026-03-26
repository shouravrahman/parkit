import ToggleButtonMui, { ToggleButtonProps } from '@mui/material/ToggleButton'
import ToggleButtonGroupMui, {
  ToggleButtonGroupProps,
} from '@mui/material/ToggleButtonGroup'
import { forwardRef } from 'react'

export const ToggleButtonGroup = forwardRef<
  JSX.Element,
  ToggleButtonGroupProps
>((props, ref) => (
  <ToggleButtonGroupMui
    classes={{ root: 'flex flex-wrap gap-1.5 mt-1.5' }}
    ref={ref}
    {...props}
  />
))

ToggleButtonGroup.displayName = 'ToggleButtonGroup'

export const ToggleButton = (props: ToggleButtonProps) => (
  <ToggleButtonMui
    classes={{
      root: 'w-10 h-10 rounded-lg border border-white/10 bg-dark-200 text-gray-400 transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/10',
      selected:
        'border-primary/60 bg-primary/15 text-primary shadow-none',
    }}
    disableRipple
    disableTouchRipple
    disableFocusRipple
    {...props}
  />
)
