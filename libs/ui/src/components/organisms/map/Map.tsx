'use client'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

export type MapProps = {
  children?: ReactNode
  height?: string
  initialViewState?: { latitude: number; longitude: number; zoom?: number }
  onLoad?: (e: {
    target: { getCenter: () => { lat: number; lng: number } }
  }) => void
  scrollZoom?: boolean
}

// Lazy-load the actual map implementation with SSR disabled
// This prevents Leaflet's window references from running on the server
const MapImpl = dynamic(() => import('./MapImpl').then((m) => m.MapImpl), {
  ssr: false,
  loading: () => (
    <div
      className="w-full bg-dark-100 animate-pulse rounded-xl"
      style={{ height: '100%', minHeight: '400px' }}
    />
  ),
})

export const Map = (props: MapProps) => <MapImpl {...props} />

export { useMap } from 'react-leaflet'
export const StyleMap = () => null
