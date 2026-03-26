'use client'
import { useDebounce } from '@parkit/util/hooks/async'
import { LatLng, LngLatTuple } from '@parkit/util/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Polyline } from 'react-leaflet'

export const Directions = ({
  origin,
  destination,
  setDistance,
  sourceId,
}: {
  origin?: LatLng
  destination?: Partial<LatLng>
  setDistance?: (distance?: number) => void
  sourceId: string
}) => {
  const [coordinates, setCoordinates] = useState<LngLatTuple[]>([])
  const prevDistanceRef = useRef<number | undefined>(undefined)
  const prevOriginRef = useRef<LatLng | undefined>(undefined)
  const prevDestinationRef = useRef<Partial<LatLng> | undefined>(undefined)

  const [originDebounced] = useDebounce(origin, 400)
  const [destinationDebounced] = useDebounce(destination, 400)

  useEffect(() => {
    if (
      !originDebounced ||
      !destinationDebounced ||
      (prevOriginRef.current?.lat === originDebounced.lat &&
        prevOriginRef.current?.lng === originDebounced.lng &&
        prevDestinationRef.current?.lat === destinationDebounced.lat &&
        prevDestinationRef.current?.lng === destinationDebounced.lng)
    ) {
      return
    }

    prevOriginRef.current = originDebounced
    prevDestinationRef.current = destinationDebounced
    ;(async () => {
      try {
        // OSRM — free, no API key
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${originDebounced.lng},${originDebounced.lat};${destinationDebounced.lng},${destinationDebounced.lat}?overview=simplified&geometries=geojson`,
        )
        const data = await response.json()
        const coords: LngLatTuple[] =
          data?.routes?.[0]?.geometry?.coordinates || []
        const newDistance = data?.routes?.[0]?.distance || 0

        setCoordinates(coords)

        if (newDistance !== prevDistanceRef.current && setDistance) {
          setDistance(newDistance)
          prevDistanceRef.current = newDistance
        }
      } catch (e) {
        console.error('Directions error:', e)
      }
    })()
  }, [originDebounced, destinationDebounced, setDistance])

  // coords from OSRM are [lng, lat], Leaflet needs [lat, lng]
  const positions = useMemo(
    () => coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
    [coordinates],
  )

  if (!positions.length) return null

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: '#f59e0b', weight: 3 }}
    />
  )
}
