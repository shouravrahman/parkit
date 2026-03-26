'use client'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider as Provider,
} from '@apollo/client'
import { ReactNode, useEffect, useRef } from 'react'
import { setContext } from '@apollo/client/link/context'

// ── Token cache ──────────────────────────────────────────────────────────────
let cachedToken: string | null = null
let tokenFetchedAt = 0
const TOKEN_TTL = 55 * 1000

const getToken = async (): Promise<string> => {
  const now = Date.now()
  if (cachedToken && now - tokenFetchedAt < TOKEN_TTL) return cachedToken
  const token = await fetch('/api/auth/token').then((r) => r.json())
  cachedToken = token || null
  tokenFetchedAt = now
  return cachedToken || ''
}

// ── Apollo client (singleton per app instance) ───────────────────────────────
const CACHE_KEY = 'apollo-cache'

let _client: ApolloClient<object> | null = null

const getClient = (uri: string): ApolloClient<object> => {
  if (_client) return _client

  const cache = new InMemoryCache({
    typePolicies: {
      ValetAssignment: { keyFields: ['bookingId'] },
    },
  })

  // Restore persisted cache on first load — eliminates flicker
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) cache.restore(JSON.parse(stored))
    } catch {}
  }

  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken()
    return {
      headers: { ...headers, authorization: token ? `Bearer ${token}` : '' },
    }
  })

  _client = new ApolloClient({
    link: authLink.concat(new HttpLink({ uri })),
    cache,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    },
  })

  return _client
}

// ── Provider ─────────────────────────────────────────────────────────────────
export const ApolloProvider = ({ children }: { children: ReactNode }) => {
  const client = getClient((process.env.NEXT_PUBLIC_API_URL ?? '') + '/graphql')

  // Persist cache to localStorage every 3s and on page hide
  useEffect(() => {
    const persist = () => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(client.cache.extract()))
      } catch {}
    }
    const interval = setInterval(persist, 3000)
    window.addEventListener('visibilitychange', persist)
    return () => {
      clearInterval(interval)
      window.removeEventListener('visibilitychange', persist)
      persist() // final save on unmount
    }
  }, [client])

  return <Provider client={client}>{children}</Provider>
}
