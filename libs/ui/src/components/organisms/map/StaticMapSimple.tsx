import Image from 'next/image'

export const StaticMapSimple = ({
  position,
  className = 'w-full shadow-xl aspect-square',
}: {
  position: { lng: number; lat: number }
  padding?: [number, number, number]
  className?: string
}) => {
  if (!position) {
    return <div className="w-full bg-gray-800 shadow-xl aspect-square" />
  }

  // Using staticmap.net — free OSM-based static map tiles
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${position.lat},${position.lng}&zoom=15&size=600x600&markers=${position.lat},${position.lng},red`

  return (
    <Image
      src={url}
      alt="Map"
      className={className}
      width={600}
      height={600}
      unoptimized
    />
  )
}
