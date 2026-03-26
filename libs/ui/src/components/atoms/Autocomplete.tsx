import MuiAutocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import { IconSearch } from '@tabler/icons-react'

type AutocompleteSimplifiedProps<T> = Omit<
  AutocompleteProps<T, false, false, false>,
  'renderInput'
> & {
  placeholder?: string
}

export const Autocomplete = <T,>({
  placeholder = 'Search...',
  ...props
}: AutocompleteSimplifiedProps<T>) => {
  return (
    <MuiAutocomplete
      autoSelect
      handleHomeEndKeys
      classes={{
        root: 'font-light',
        input: 'p-0 text-white placeholder-gray-500',
        noOptions: 'text-gray-400 text-sm bg-dark-100',
        loading: 'text-gray-400 text-sm bg-dark-100',
        listbox: 'p-0 max-h-64 bg-dark-100',
        option:
          'text-gray-200 text-sm hover:bg-dark-200 aria-selected:bg-primary/10 aria-selected:text-primary',
        paper: 'shadow-xl border border-white/10 mt-1 bg-dark-100 rounded-lg',
      }}
      renderInput={(params) => (
        <div
          ref={params.InputProps.ref}
          className="flex items-center gap-2 bg-dark-200 border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
        >
          <IconSearch className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            type="text"
            {...params.inputProps}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none border-0 shadow-none focus:ring-0 min-w-0"
            placeholder={placeholder}
          />
        </div>
      )}
      {...props}
    />
  )
}
