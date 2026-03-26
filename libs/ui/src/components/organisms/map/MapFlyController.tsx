'use client'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapFly } from './MapFlyContext'
import { LatLngBounds } from 'leaflet'

export const MapFlyController = () => {
  const map = useMap()
  const flyRef = useMapFly()

  useEffect(() => {
    flyRef.current = (lat, lng, zoom = 13, boundingbox) => {
      if (boundingbox) {
        // boundingbox from Nominatim: [south, north, west, east]
        const [south, north, west, east] = boundingbox.map(parseFloat)
        map.fitBounds(new LatLngBounds([south, west], [north, east]), {
          animate: true,
          padding: [20, 20],
        })
      } else {
        map.flyTo([lat, lng], zoom)
      }
    }
    return () => {
      flyRef.current = null
    }
  }, [map, flyRef])

  return null
}
