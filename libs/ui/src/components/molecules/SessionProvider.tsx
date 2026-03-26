'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={5 * 60}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
