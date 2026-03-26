import React, { HTMLProps } from 'react'

export const HtmlTextArea = React.forwardRef<
  HTMLTextAreaElement,
  HTMLProps<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={`block w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 read-only:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200 sm:text-sm resize-none ${className}`}
  />
))
HtmlTextArea.displayName = 'TextArea'
