'use client'
import { IconCurrentLocation } from '@tabler/icons-react'
import { useMap } from 'react-leaflet'
import { Button } from '../../atoms/Button'

export const CurrentLocationButton = () => {
  const map = useMap()

  return (
    <Button
      variant="text"
      className="hover:bg-gray-200"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            map.flyTo([latitude, longitude], 10)
          },
          (error) => console.error(error),
          { enableHighAccuracy: true, timeout: 20000 },
        )
      }}
    >
      <IconCurrentLocation className="stroke-1.5" />
    </Button>
  )
}
