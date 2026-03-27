'use client'
import { useState, useEffect, useRef } from 'react'
import {
  useQuery,
  useMutation,
  useSubscription,
} from '@parkit/network/src/config/apollo-hooks'
import {
  MyNotificationsDocument,
  MyNotificationsQuery,
  MarkNotificationAsReadDocument,
  MarkAllNotificationsAsReadDocument,
  NotificationAddedDocument,
  NotificationAddedSubscription,
  MyUnreadNotificationsCountDocument,
} from '@parkit/network/src/gql/generated'
import { IconBell, IconBellRinging } from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'

type Notification = MyNotificationsQuery['myNotifications'][number]

const typeColors: Record<string, string> = {
  BOOKING_CONFIRMED: 'bg-green-500',
  BOOKING_STATUS_UPDATED: 'bg-blue-500',
  VALET_ASSIGNED: 'bg-amber-500',
  VERIFICATION_UPDATED: 'bg-purple-500',
  NEW_BOOKING: 'bg-primary',
}

export const NotificationBell = () => {
  const session = useSession()
  const uid = session?.data?.user?.uid
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data, refetch } = useQuery(MyNotificationsDocument, {
    skip: !uid,
    fetchPolicy: 'cache-and-network',
  })

  const { data: countData, refetch: refetchCount } = useQuery(
    MyUnreadNotificationsCountDocument,
    { skip: !uid, fetchPolicy: 'cache-and-network' },
  )

  const [markAsRead] = useMutation(MarkNotificationAsReadDocument, {
    onCompleted: () => {
      refetch()
      refetchCount()
    },
  })

  const [markAllAsRead] = useMutation(MarkAllNotificationsAsReadDocument, {
    onCompleted: () => {
      refetch()
      refetchCount()
    },
  })

  // Real-time subscription
  useSubscription<NotificationAddedSubscription>(NotificationAddedDocument, {
    skip: !uid,
    onData: () => {
      refetch()
      refetchCount()
    },
  })

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!uid) return null

  const notifications = data?.myNotifications ?? []
  const unreadCount = countData?.myUnreadNotificationsCount ?? 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <IconBellRinging className="w-5 h-5 text-primary" />
        ) : (
          <IconBell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-dark text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-dark-100 border border-white/10 rounded-xl shadow-2xl z-[600] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-semibold text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <IconBell className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            )}
            {notifications.map((n: Notification) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.read) markAsRead({ variables: { id: n.id } })
                }}
                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex gap-3 items-start ${
                  n.read ? 'opacity-60' : ''
                }`}
              >
                <span
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    n.read
                      ? 'bg-gray-600'
                      : (typeColors[n.type] ?? 'bg-primary')
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
