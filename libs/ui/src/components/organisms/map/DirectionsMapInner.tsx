'use client'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import { DivIcon, LatLngBounds } from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { LatLng } from '@parkit/util/types'

const makeIcon = (color: string, label: string) =>
  new DivIcon({
    html: `<div style="width:28px;height:28px;background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
      <span style="transform:rotate(45deg);font-size:11px;font-weight:700;color:#fff;">${label}</span>
    </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })

const FitBounds = ({ start, end }: { start: LatLng; end: LatLng }) => {
  const map = useMap()
  useEffect(() => {
    const bounds = new LatLngBounds(
      [start.lat, start.lng],
      [end.lat, end.lng],
    )
    map.fitBounds(bounds, { padding: [30, 30] })
  }, [start, end, map])
  return null
}

export const DirectionsMapInner = ({
  start,
  end,
  coordinates,
}: {
  start: LatLng
  end: LatLng
  coordinates: [number, number][]
}) => {
  // OSRM coords are [lng, lat], Leaflet needs [lat, lng]
  const positions = coordinates.map(([lng, lat]) => [lat, lng] as [number, number])

  return (
    <MapContainer
      center={[start.lat, start.lng]}
      zoom={13}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      doubleClickZoom={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%', minHeight: '200px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds start={start} end={end} />
      <Marker position={[start.lat, start.lng]} icon={makeIcon('#22c55e', 'A')} />
      <Marker position={[end.lat, end.lng]} icon={makeIcon('#f59e0b', 'P')} />
      {positions.length > 0 && (
        <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }} />
      )}
    </MapContainer>
  )
}
