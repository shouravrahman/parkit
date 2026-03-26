import Slider, { SliderProps } from '@mui/material/Slider'

export const RangeSlider = (props: SliderProps) => (
  <div className="w-full pt-7 pl-2 pr-4">
    <Slider
      valueLabelDisplay="on"
      classes={{
        root: 'h-px w-full border-0',
        thumb:
          'w-3.5 h-3.5 rounded-sm border border-primary/60 bg-primary shadow-none hover:shadow-none hover:bg-primary-400 after:w-8 after:h-8',
        track: 'text-primary',
        rail: 'bg-dark-400',
        valueLabel:
          'text-xs text-primary-900 bg-primary rounded py-0.5 px-1.5 font-medium',
      }}
      {...props}
    />
  </div>
)
