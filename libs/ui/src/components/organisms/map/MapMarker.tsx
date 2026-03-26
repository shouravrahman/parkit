'use client'
import { Marker as LeafletMarker, DivIcon } from 'leaflet'
import { Marker as RLMarker } from 'react-leaflet'
import { ReactNode } from 'react'

export type MarkerProps = {
  latitude: number
  longitude: number
  children?: ReactNode
  draggable?: boolean
  onDragEnd?: (e: { lngLat: { lat: number; lng: number } }) => void
  pitchAlignment?: string
  onClick?: (e: any) => void
  variant?: 'parking' | 'user'
}

const makeIcon = (html: string) =>
  new DivIcon({
    html,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })

const parkingIcon = makeIcon(`
  <div style="width:32px;height:32px;background:#f59e0b;border:2px solid #000;border-radius:6px;
    display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;
    color:#000;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;">P</div>
`)

const userIcon = makeIcon(`
  <div style="width:32px;height:32px;background:#3b82f6;border:2px solid #fff;border-radius:50%;
    display:flex;align-items:center;justify-content:center;font-size:16px;
    box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;">👤</div>
`)

export const Marker = ({
  latitude,
  longitude,
  draggable,
  onDragEnd,
  onClick,
  variant = 'parking',
}: MarkerProps) => {
  return (
    <RLMarker
      position={[latitude, longitude]}
      draggable={draggable}
      icon={variant === 'user' ? userIcon : parkingIcon}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = (e.target as LeafletMarker).getLatLng()
          onDragEnd?.({ lngLat: { lat, lng } })
        },
        click(e) {
          onClick?.(e)
        },
      }}
    />
  )
}
