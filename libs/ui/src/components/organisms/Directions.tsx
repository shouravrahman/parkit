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
  color = '#f59e0b',
}: {
  origin?: LatLng
  destination?: Partial<LatLng>
  setDistance?: (distance?: number) => void
  sourceId: string
  color?: string
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

    // Skip if same point
    if (
      Math.abs((originDebounced.lat || 0) - (destinationDebounced.lat || 0)) < 0.0001 &&
      Math.abs((originDebounced.lng || 0) - (destinationDebounced.lng || 0)) < 0.0001
    ) {
      return
    }

    prevOriginRef.current = originDebounced
    prevDestinationRef.current = destinationDebounced
    ;(async () => {
      try {
        // OSRM — free, no API key
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${originDebounced.lng},${originDebounced.lat};${destinationDebounced.lng},${destinationDebounced.lat}?overview=full&geometries=geojson`,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originDebounced, destinationDebounced])

  // coords from OSRM are [lng, lat], Leaflet needs [lat, lng]
  const positions = useMemo(
    () => coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
    [coordinates],
  )

  if (!positions.length) return null

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color, weight: 4, opacity: 0.85 }}
    />
  )
}
