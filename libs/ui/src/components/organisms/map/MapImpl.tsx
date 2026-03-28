'use client'
import { ReactNode, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type MapProps = {
  children?: ReactNode
  height?: string
  initialViewState?: { latitude: number; longitude: number; zoom?: number }
  onLoad?: (e: {
    target: { getCenter: () => { lat: number; lng: number } }
  }) => void
  scrollZoom?: boolean
}

const OnLoadHandler = ({ onLoad }: { onLoad?: MapProps['onLoad'] }) => {
  const map = useMap()
  const fired = useRef(false)
  useEffect(() => {
    if (!fired.current) {
      fired.current = true
      onLoad?.({ target: { getCenter: () => map.getCenter() } })
    }
  }, [map, onLoad])
  return null
}

export const MapImpl = ({
  height = 'calc(100vh - 4rem)',
  initialViewState,
  onLoad,
  scrollZoom = true,
  children,
}: MapProps) => {
  const center: LatLngExpression = [
    initialViewState?.latitude ?? 20,
    initialViewState?.longitude ?? 0,
  ]
  const zoom = initialViewState?.zoom ?? 2

  return (
    <div style={{ height }} className="w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollZoom}
        style={{ height: '100%', width: '100%', background: '#1a1a2e', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
        />
        <OnLoadHandler onLoad={onLoad} />
        {children}
      </MapContainer>
    </div>
  )
}
