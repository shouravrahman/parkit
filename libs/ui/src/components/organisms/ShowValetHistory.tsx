'use client'
import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useQuery } from '@apollo/client'
import {
  BookingStatus,
  MyPickupTripsDocument,
  MyDropTripsDocument,
  SortOrder,
} from '@parkit/network/src/gql/generated'
import { ShowData } from './ShowData'
import { ValetTripCard } from './ValetTripCard'
import { Reveal } from '../molecules/Reveal'
import { format } from 'date-fns'

const statusColor: Record<string, string> = {
  CHECKED_IN: 'bg-green/15 text-green-400 border-green/30',
  CHECKED_OUT: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  VALET_RETURNED: 'bg-green/15 text-green-400 border-green/30',
  VALET_PICKED_UP: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  VALET_ASSIGNED_FOR_CHECK_OUT:
    'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

const completedStatuses = [
  BookingStatus.CheckedIn,
  BookingStatus.CheckedOut,
  BookingStatus.ValetAssignedForCheckOut,
  BookingStatus.ValetReturned,
]

const HistoryCard = ({
  booking,
  start,
  end,
}: {
  booking: {
    id: number
    startTime: string
    vehicleNumber: string
    passcode?: string | null
    status: BookingStatus
  }
  start: { lat?: number | null; lng?: number | null }
  end: { lat?: number | null; lng?: number | null } | null | undefined
}) => (
  <ValetTripCard
    booking={{ id: booking.id, time: booking.startTime }}
    start={{ lat: start.lat ?? undefined, lng: start.lng ?? undefined }}
    end={end ? { lat: end.lat ?? undefined, lng: end.lng ?? undefined } : undefined}
  >
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">
          {booking.vehicleNumber}
        </span>
        <Reveal
          secret={booking.passcode ?? ''}
          showIntruction={false}
          className="w-32"
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            statusColor[booking.status] ??
            'bg-gray-500/15 text-gray-400 border-gray-500/30'
          }`}
        >
          {booking.status.split('_').join(' ')}
        </span>
        <span className="text-xs text-gray-500">
          {format(new Date(booking.startTime), 'PP')}
        </span>
      </div>
    </div>
  </ValetTripCard>
)

export const ShowValetHistory = ({ uid }: { uid: string }) => {
  const { setSkip, setTake, skip, take } = useTakeSkip()

  // Pickup history — trips where this valet did the pickup
  const { data: pickupData, loading: pickupLoading } = useQuery(
    MyPickupTripsDocument,
    {
      variables: {
        skip,
        take,
        orderBy: { startTime: SortOrder.Desc },
        where: {
          status: { in: completedStatuses },
          ValetAssignment: { is: { pickupValetId: { equals: uid } } },
        },
      },
    },
  )

  // Drop history — trips where this valet did the return
  const { data: dropData, loading: dropLoading } = useQuery(
    MyDropTripsDocument,
    {
      variables: {
        skip,
        take,
        orderBy: { startTime: SortOrder.Desc },
        where: {
          status: { in: [BookingStatus.ValetReturned] },
          ValetAssignment: { is: { returnValetId: { equals: uid } } },
        },
      },
    },
  )

  const loading = pickupLoading || dropLoading
  const pickupTrips = pickupData?.bookingsForValet ?? []
  const dropTrips = dropData?.bookingsForValet ?? []
  // Deduplicate by id (same booking can appear in both if valet did both roles)
  const allIds = new Set(pickupTrips.map((b: {id: number}) => b.id))
  const uniqueDropTrips = dropTrips.filter((b: {id: number}) => !allIds.has(b.id))
  const total =
    (pickupData?.bookingsCount.count ?? 0) +
    (dropData?.bookingsCount.count ?? 0)

  return (
    <ShowData
      loading={loading}
      pagination={{
        setSkip,
        setTake,
        skip,
        take,
        resultCount: pickupTrips.length + uniqueDropTrips.length,
        totalCount: total,
      }}
    >
      {pickupTrips.map((booking: (typeof pickupTrips)[number]) => (
        <HistoryCard
          key={`pickup-${booking.id}`}
          booking={booking}
          start={{
            lat: booking.valetAssignment?.pickupLat,
            lng: booking.valetAssignment?.pickupLng,
          }}
          end={booking.slot.garage.address}
        />
      ))}
      {uniqueDropTrips.map((booking: (typeof dropTrips)[number]) => (
        <HistoryCard
          key={`drop-${booking.id}`}
          booking={booking}
          start={booking.slot.garage.address ? { lat: booking.slot.garage.address.lat, lng: booking.slot.garage.address.lng } : { lat: undefined, lng: undefined }}
          end={{
            lat: booking.valetAssignment?.returnLat ?? undefined,
            lng: booking.valetAssignment?.returnLng ?? undefined,
          }}
        />
      ))}
    </ShowData>
  )
}
