import {
  BookingStatus,
  BookingsForGarageDocument,
  QueryMode,
} from '@parkit/network/src/gql/generated'
import { IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { ShowData } from './ShowData'
import { ManageBookingCard } from './ManageBookingCard'

export const ShowGarageBookings = ({
  garageId,
  statuses,
}: {
  garageId: number
  statuses: BookingStatus[]
  showCheckIn?: boolean
  showCheckOut?: boolean
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const { take, setTake, skip, setSkip } = useTakeSkip()

  const { data, loading } = useQuery(BookingsForGarageDocument, {
    variables: {
      skip,
      take,
      where: {
        status: { in: statuses },
        Slot: { is: { garageId: { equals: garageId } } },
        ...(searchTerm && {
          vehicleNumber: {
            contains: searchTerm,
            mode: QueryMode.Insensitive,
          },
        }),
      },
    },
  })

  return (
    <div className="mt-4 space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-dark-200 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-primary/50 transition-colors max-w-sm">
        <IconSearch className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          placeholder="Search vehicle number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
      </div>

      {/* Cards */}
      <ShowData
        loading={loading}
        pagination={{
          skip,
          take,
          resultCount: data?.bookingsForGarage.length,
          totalCount: data?.bookingsCount.count,
          setSkip,
          setTake,
        }}
        childrenClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {data?.bookingsForGarage.map((booking: (typeof data)["bookingsForGarage"][number]) => (
          <ManageBookingCard key={booking.id} booking={booking} />
        ))}
      </ShowData>
    </div>
  )
}
