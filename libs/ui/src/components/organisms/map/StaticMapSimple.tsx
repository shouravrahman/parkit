'use client'
import dynamic from 'next/dynamic'

const StaticMapInner = dynamic(
  () => import('./StaticMapInner').then((m) => m.StaticMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square bg-dark-200 animate-pulse rounded-lg" />
    ),
  },
)

export const StaticMapSimple = ({
  position,
  className = 'w-full aspect-square',
}: {
  position: { lng: number; lat: number }
  padding?: [number, number, number]
  className?: string
}) => {
  if (!position?.lat || !position?.lng) {
    return <div className="w-full aspect-square bg-dark-200 rounded-lg" />
  }
  return (
    <div className={className}>
      <StaticMapInner lat={position.lat} lng={position.lng} />
    </div>
  )
}
