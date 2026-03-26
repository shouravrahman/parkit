'use client'
import dynamic from 'next/dynamic'
import { LatLng } from '@parkit/util/types'

const DirectionsMapInner = dynamic(
  () => import('./DirectionsMapInner').then((m) => m.DirectionsMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square bg-dark-200 animate-pulse" />
    ),
  },
)

export const StaticMapDirections = ({
  start,
  end,
  coordinates,
  className = 'w-full aspect-square',
}: {
  start: LatLng
  end: LatLng
  coordinates: [number, number][]
  padding?: [number, number, number]
  className?: string
}) => {
  return (
    <div className={className}>
      <DirectionsMapInner start={start} end={end} coordinates={coordinates} />
    </div>
  )
}
