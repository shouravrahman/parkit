'use client'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const parkingIcon = new DivIcon({
  html: `<div style="width:28px;height:28px;background:#f59e0b;border:2px solid #000;border-radius:6px;
    display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;
    color:#000;box-shadow:0 2px 6px rgba(0,0,0,0.5);">P</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export const StaticMapInner = ({ lat, lng }: { lat: number; lng: number }) => (
  <MapContainer
    center={[lat, lng]}
    zoom={15}
    scrollWheelZoom={false}
    dragging={false}
    zoomControl={false}
    doubleClickZoom={false}
    attributionControl={false}
    style={{ height: '100%', width: '100%', minHeight: '180px', borderRadius: '0.5rem' }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[lat, lng]} icon={parkingIcon} />
  </MapContainer>
)
