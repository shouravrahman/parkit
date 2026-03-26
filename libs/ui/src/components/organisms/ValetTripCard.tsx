import { useMapboxDirections as useDirections } from '@parkit/util/hooks/directions'
import { LatLng } from '@parkit/util/types'
import { isLatLng } from '@parkit/util'
import { ReactNode } from 'react'
import { AlertSection } from '../molecules/AlertSection'
import { MapLink } from '../molecules/MapLink'
import { StaticMapDirections } from './map/StaticMapDirections'
import { format } from 'date-fns'

export interface IValetTripCardProps {
  start?: Partial<LatLng> | null
  end?: Partial<LatLng> | null
  booking: {
    id: number
    time: string
  }
  children?: ReactNode
}

export const ValetTripCard = ({
  start,
  end,
  booking,
  children,
}: IValetTripCardProps) => {
  const { data, distance, error, loading } = useDirections(start, end)

  if (!isLatLng(start) || !isLatLng(end)) {
    return (
      <AlertSection>
        <div>Something went wrong.</div>
        <div className="text-xs">Start end locations not set.</div>
      </AlertSection>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <MapLink waypoints={[start, end]}>
        <StaticMapDirections start={start} end={end} coordinates={data} />
      </MapLink>
      <div className="p-3 bg-dark-100 space-y-2 border-t border-white/10">
        <div className="flex justify-between gap-2 items-start">
          <div>
            <div className="text-lg font-semibold text-white">
              {format(new Date(booking.time), 'p')}
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(booking.time), 'PP')}
            </div>
          </div>
          <div className="font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg text-sm border border-primary/30">
            {((distance || 0) / 1000).toFixed(2)} km
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
