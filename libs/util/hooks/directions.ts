import { LatLng } from '../types'
import { useEffect, useRef, useState } from 'react'

export const useMapboxDirections = (
  start?: Partial<LatLng> | null,
  end?: Partial<LatLng> | null,
) => {
  const [data, setData] = useState<[number, number][]>([])
  const [distance, setDistance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use stable primitive deps to avoid infinite refetch from object reference changes
  const startLat = start?.lat
  const startLng = start?.lng
  const endLat = end?.lat
  const endLng = end?.lng

  useEffect(() => {
    if (!startLat || !startLng || !endLat || !endLng) {
      setData([])
      setDistance(null)
      return
    }

    // Skip if same point
    if (
      Math.abs(startLat - endLat) < 0.0001 &&
      Math.abs(startLng - endLng) < 0.0001
    ) {
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`,
    )
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        if (!json.routes?.length) {
          setError('No route found')
          setData([])
          setDistance(null)
          return
        }
        // OSRM returns [lng, lat] — keep as-is, DirectionsMapInner converts
        const coords: [number, number][] =
          json.routes[0].geometry?.coordinates || []
        setData(coords)
        setDistance(json.routes[0].distance ?? null)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Directions error:', err)
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [startLat, startLng, endLat, endLng])

  return { data, distance, loading, error }
}
