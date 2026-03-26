import { LatLng } from '@parkit/util/types'
import Image from 'next/image'

export const StaticMapDirections = ({
  start,
  end,
  coordinates,
  className = 'w-full shadow-xl aspect-square',
}: {
  start: LatLng
  end: LatLng
  padding?: [number, number, number]
  coordinates: [number, number][]
  className?: string
}) => {
  if (!coordinates.length) {
    return <div className="w-full bg-gray-800 shadow-xl aspect-square" />
  }

  // Build a path string for staticmap
  const pathPoints = coordinates.map(([lng, lat]) => `${lat},${lng}`).join('|')
  const centerLat = (start.lat + end.lat) / 2
  const centerLng = (start.lng + end.lng) / 2

  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=13&size=600x600&markers=${start.lat},${start.lng},green|${end.lat},${end.lng},red&path=${encodeURIComponent(pathPoints)}`

  return (
    <Image
      width={600}
      height={600}
      src={url}
      alt="Map"
      className={className}
      unoptimized
    />
  )
}
