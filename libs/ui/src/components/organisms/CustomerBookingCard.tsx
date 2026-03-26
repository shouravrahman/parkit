import { BookingsForCustomerQuery } from '@parkit/network/src/gql/generated'
import { StartEndDateCard } from './DateCard'
import { MapLink } from '../molecules/MapLink'
import { StaticMapSimple } from './map/StaticMapSimple'
import { Reveal } from '../molecules/Reveal'
import { Accordion } from '../atoms/Accordion'
import { format } from 'date-fns'
import { Badge } from '../atoms/Badge'

export interface IBookingCardProps {
  booking: NonNullable<BookingsForCustomerQuery['bookingsForCustomer']>[number]
}

const statusVariant = (status: string): 'primary' | 'green' | 'gray' | 'red' => {
  if (status === 'BOOKED') return 'primary'
  if (status.includes('COMPLETED')) return 'green'
  if (status.includes('CANCELLED')) return 'red'
  return 'gray'
}

export const CustomerBookingCard = ({ booking }: IBookingCardProps) => {
  const lat = booking.slot.garage.address?.lat || 0
  const lng = booking.slot.garage.address?.lng || 0

  return (
    <div className="bg-dark-100 border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-primary/30 transition-colors duration-300">
      {/* Map */}
      <MapLink waypoints={[{ lat, lng }]}>
        <div className="h-40 w-full">
          <StaticMapSimple position={{ lat, lng }} className="h-full w-full" />
        </div>
      </MapLink>

      <div className="p-4 flex flex-col gap-3">
        {/* Time range */}
        <StartEndDateCard
          startTime={booking.startTime}
          endTime={booking.endTime}
        />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Slot</p>
            <p className="text-sm text-white font-medium">{booking.slot.displayName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Vehicle</p>
            <p className="text-sm text-white font-medium">{booking.vehicleNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Address</p>
            <p className="text-sm text-white">{booking.slot.garage.address?.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Code</p>
            <Reveal secret={booking.passcode || ''} />
          </div>
        </div>

        {/* Status + timeline */}
        <Accordion
          defaultOpen={false}
          title={
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status</span>
              <Badge variant={statusVariant(booking.status)} size="sm">
                {booking.status.split('_').join(' ')}
              </Badge>
            </div>
          }
        >
          <div className="flex flex-col gap-2 mt-2">
            {booking.bookingTimeline.map((timeline: { status: string; timestamp: string }) => (
              <div key={timeline.timestamp} className="flex justify-between text-xs">
                <span className="text-gray-400">{timeline.status.split('_').join(' ')}</span>
                <span className="text-gray-500">{format(new Date(timeline.timestamp), 'PPp')}</span>
              </div>
            ))}
          </div>
        </Accordion>
      </div>
    </div>
  )
}
