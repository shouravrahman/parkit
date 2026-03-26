'use client'
import { MouseEventHandler, ReactNode } from 'react'
import { IconMinus, IconParking, IconPlus } from '@tabler/icons-react'
import { useMap } from 'react-leaflet'

const MapControls = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col overflow-hidden rounded shadow-lg divide-y divide-white/10 backdrop-blur-sm">
    {children}
  </div>
)

const ZoomControlButton = ({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: MouseEventHandler<HTMLButtonElement>
}) => (
  <button
    className="bg-white/80 hover:bg-white transition-colors"
    type="button"
    onClick={onClick}
  >
    {children}
  </button>
)

const ZoomIn = () => {
  const map = useMap()
  return (
    <ZoomControlButton onClick={() => map.zoomIn()}>
      <IconPlus className="w-8 h-8 p-1.5 text-black" />
    </ZoomControlButton>
  )
}

const ZoomOut = () => {
  const map = useMap()
  return (
    <ZoomControlButton onClick={() => map.zoomOut()}>
      <IconMinus className="w-8 h-8 p-1.5 text-black" />
    </ZoomControlButton>
  )
}

export const CenterOfMap = ({
  onClick,
  Icon = IconParking,
}: {
  onClick: (latLng: { lng: number; lat: number }) => void
  Icon?: typeof IconParking
}) => {
  const map = useMap()
  return (
    <ZoomControlButton
      onClick={() => {
        const { lat, lng } = map.getCenter()
        onClick({ lat, lng })
      }}
    >
      <Icon className="w-8 h-8 p-1.5 text-black" />
    </ZoomControlButton>
  )
}

MapControls.ZoomIn = ZoomIn
MapControls.ZoomOut = ZoomOut
MapControls.CenterOfMap = CenterOfMap

export default MapControls

export const DefaultZoomControls = ({ children }: { children?: ReactNode }) => (
  <MapControls>
    <ZoomIn />
    <ZoomOut />
    {children}
  </MapControls>
)
