import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useQuery } from '@apollo/client'
import {
  BookingStatus,
  MyPickupTripsDocument,
  SortOrder,
} from '@parkit/network/src/gql/generated'
import { ShowData } from './ShowData'
import { ValetTripCard } from './ValetTripCard'
import { Reveal } from '../molecules/Reveal'
import { AssignValetButton } from './AssignValetButton'

export const ShowValetMyPickupTrips = ({ uid }: { uid: string }) => {
  const { setSkip, setTake, skip, take } = useTakeSkip()

  const { data, loading } = useQuery(MyPickupTripsDocument, {
    variables: {
      skip,
      take,
      orderBy: { startTime: SortOrder.Asc },
      where: {
        BookingTimeline: {
          none: {
            status: BookingStatus.CheckedIn,
          },
        },
        ValetAssignment: {
          is: {
            pickupValetId: { equals: uid },
          },
        },
      },
    },
  })

  return (
    <ShowData
      loading={loading}
      pagination={{
        setSkip,
        setTake,
        skip,
        take,
        resultCount: data?.bookingsForValet.length || 0,
        totalCount: data?.bookingsCount.count || 0,
      }}
    >
      {data?.bookingsForValet.map((booking) => (
        <ValetTripCard
          key={booking.id}
          booking={{
            id: booking.id,
            time: booking.startTime,
          }}
          start={{
            lat: booking.valetAssignment?.pickupLat,
            lng: booking.valetAssignment?.pickupLng,
          }}
          end={booking.slot.garage.address}
        >
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-xl font-semibold ">
                {booking.vehicleNumber}
              </div>

              <Reveal
                secret={booking.passcode}
                showIntruction={false}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                booking.status === BookingStatus.ValetPickedUp
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-primary/15 text-primary border-primary/30'
              }`}>
                {booking.status?.split('_').join(' ')}
              </span>
            </div>

            {booking.status === BookingStatus.ValetAssignedForCheckIn ? (
              <AssignValetButton
                bookingId={booking.id}
                status={BookingStatus.ValetPickedUp}
              >
                Picked Up — On the way to garage
              </AssignValetButton>
            ) : null}
            {booking.status === BookingStatus.ValetPickedUp ? (
              <p className="text-xs text-gray-500">
                Waiting for manager to check in at garage
              </p>
            ) : null}
          </div>
        </ValetTripCard>
      ))}
    </ShowData>
  )
}
