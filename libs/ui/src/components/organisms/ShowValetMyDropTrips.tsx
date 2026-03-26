import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useQuery } from '@apollo/client'
import {
  BookingStatus,
  MyDropTripsDocument,
  SortOrder,
} from '@parkit/network/src/gql/generated'
import { ShowData } from './ShowData'
import { ValetTripCard } from './ValetTripCard'
import { Reveal } from '../molecules/Reveal'
import { AssignValetButton } from './AssignValetButton'

export const ShowValetMyDropTrips = ({ uid }: { uid: string }) => {
  const { setSkip, setTake, skip, take } = useTakeSkip()

  const { data, loading } = useQuery(MyDropTripsDocument, {
    variables: {
      skip,
      take,
      orderBy: { endTime: SortOrder.Asc },
      where: {
        BookingTimeline: {
          none: {
            status: BookingStatus.ValetReturned,
          },
        },
        ValetAssignment: {
          is: {
            returnValetId: { equals: uid },
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
          end={{
            lat: booking.valetAssignment?.returnLat || undefined,
            lng: booking.valetAssignment?.returnLng || undefined,
          }}
          start={booking.slot.garage.address}
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
                booking.status === BookingStatus.ValetAssignedForCheckOut
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-primary/15 text-primary border-primary/30'
              }`}>
                {booking.status?.split('_').join(' ')}
              </span>
            </div>

            {[
              BookingStatus.CheckedOut,
              BookingStatus.ValetAssignedForCheckOut,
            ].includes(booking.status) ? (
              <AssignValetButton
                bookingId={booking.id}
                status={BookingStatus.ValetReturned}
              >
                Drop
              </AssignValetButton>
            ) : null}
          </div>
        </ValetTripCard>
      ))}
    </ShowData>
  )
}
