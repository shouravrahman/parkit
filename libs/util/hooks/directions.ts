import { LatLng } from '../types'
import { useEffect, useState } from 'react'

export const useMapboxDirections = (
  start?: Partial<LatLng> | null,
  end?: Partial<LatLng> | null,
) => {
  const [data, setData] = useState<[number, number][]>([])
  const [distance, setDistance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!start || !end || !start.lng || !start.lat || !end.lng || !end.lat) {
      setData([])
      setDistance(null)
      return
    }

    setLoading(true)
    const fetchData = async () => {
      try {
        // Using OSRM (Open Source Routing Machine) - free, no API key needed
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson`,
        )
        const data = await response.json()

        if (!data.routes || data.routes.length === 0) {
          setError('No route found')
          setData([])
          setDistance(null)
          return
        }

        // Extract coordinates from GeoJSON geometry
        const coordinates =
          data.routes[0].geometry?.coordinates?.map(
            (coord: [number, number]) => [coord[1], coord[0]], // Convert [lng,lat] to [lat,lng]
          ) || []

        setData(coordinates)
        setDistance(data.routes[0].distance) // Distance in meters
      } catch (error: any) {
        console.error('Directions error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [start, end])

  return { data, distance, loading, error }
}
