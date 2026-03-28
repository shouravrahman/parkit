'use client'
import {
  BookingsForGarageQuery,
  UpdateBookingStatusDocument,
  namedOperations,
} from '@parkit/network/src/gql/generated'
import { TitleStrongValue, TitleValue } from '../atoms/TitleValue'
import { Reveal } from '../molecules/Reveal'
import { StartEndDateCard } from './DateCard'
import { Accordion } from '../atoms/Accordion'
import { Button } from '../atoms/Button'
import { format } from 'date-fns'
import { useMutation } from '@apollo/client'

export interface IManageBookingCardProps {
  booking: BookingsForGarageQuery['bookingsForGarage'][0]
}

// Status machine: what transition is available from each status
const nextStatus: Record<string, { label: string; status: string } | null> = {
  BOOKED: { label: 'Check In', status: 'CHECKED_IN' },
  CHECKED_IN: { label: 'Check Out', status: 'CHECKED_OUT' },
  VALET_PICKED_UP: { label: 'Check In', status: 'CHECKED_IN' },
  VALET_ASSIGNED_FOR_CHECK_IN: { label: 'Pick Up', status: 'VALET_PICKED_UP' },
  VALET_ASSIGNED_FOR_CHECK_OUT: { label: 'Return', status: 'VALET_RETURNED' },
  VALET_RETURNED: { label: 'Check Out', status: 'CHECKED_OUT' },
  CHECKED_OUT: null,
}

const statusColor: Record<string, string> = {
  BOOKED: 'text-primary',
  CHECKED_IN: 'text-green-400',
  CHECKED_OUT: 'text-gray-400',
  VALET_ASSIGNED_FOR_CHECK_IN: 'text-blue-400',
  VALET_PICKED_UP: 'text-blue-400',
  VALET_ASSIGNED_FOR_CHECK_OUT: 'text-purple-400',
  VALET_RETURNED: 'text-green-400',
}

export const ManageBookingCard = ({ booking }: IManageBookingCardProps) => {
  const [updateStatus, { loading }] = useMutation(UpdateBookingStatusDocument, {
    refetchQueries: [namedOperations.Query.BookingsForGarage],
  })

  const transition = nextStatus[booking.status] ?? null

  return (
    <div className="p-4 space-y-3 bg-dark-100 border border-white/10 rounded-xl hover:border-primary/30 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <TitleStrongValue title="Vehicle number">
          <div className="text-2xl font-bold text-white">
            {booking.vehicleNumber}
          </div>
        </TitleStrongValue>
        <div className="px-2 py-1 border border-primary/50 rounded-lg bg-primary/10 text-primary text-xs shrink-0">
          <TitleValue title="Slot">{booking.slot.displayName}</TitleValue>
        </div>
      </div>

      <StartEndDateCard
        startTime={booking.startTime}
        endTime={booking.endTime}
      />

      <TitleStrongValue title="Code">
        <Reveal showIntruction={false} secret={booking.passcode || ''} />
      </TitleStrongValue>

      {booking.valetAssignment?.pickupValet && (
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
          <img
            src={booking.valetAssignment.pickupValet.image || '/default-avatar.png'}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Assigned Valet</p>
            <p className="text-sm font-medium text-white">{booking.valetAssignment.pickupValet.displayName}</p>
          </div>
        </div>
      )}

      {/* Status + action */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p
            className={`text-sm font-semibold ${statusColor[booking.status] ?? 'text-white'}`}
          >
            {booking.status.split('_').join(' ')}
          </p>
        </div>
        {transition && (
          <Button
            size="sm"
            loading={loading}
            onClick={() =>
              updateStatus({
                variables: {
                  bookingId: booking.id,
                  status: transition.status,
                },
              })
            }
          >
            {transition.label}
          </Button>
        )}
      </div>

      {/* Timeline */}
      <Accordion
        defaultOpen={false}
        title={<span className="text-xs text-gray-500">View timeline</span>}
      >
        <div className="flex flex-col gap-2 mt-2">
          {booking.bookingTimeline.map((timeline: { status: string; timestamp: string }) => (
            <div
              key={timeline.timestamp}
              className="flex justify-between text-xs"
            >
              <span className="text-gray-400">
                {timeline.status.split('_').join(' ')}
              </span>
              <span className="text-gray-600">
                {format(new Date(timeline.timestamp), 'PPp')}
              </span>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  )
}
