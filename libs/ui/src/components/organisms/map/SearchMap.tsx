"use client"
import React from 'react'
import { Map } from './Map'
import { MapFlyController } from './MapFlyController'
import { Panel } from './Panel'
import { DefaultZoomControls } from './ZoomControls'

import { useMapEvents } from 'react-leaflet'
import { ShowGarages } from '../search/ShowGarages'

type Props = {
  initialViewState?: any
  height?: string | number
  onBoundsChange?: (bounds: {
    ne_lat: number
    ne_lng: number
    sw_lat: number
    sw_lng: number
  }) => void
  children?: React.ReactNode
}

const BoundsWatcher: React.FC<{ onBoundsChange?: Props['onBoundsChange'] }> = ({ onBoundsChange }) => {
  if (!onBoundsChange) return null

  const getBounds = (m: any) => ({
    ne_lat: m.getBounds().getNorthEast().lat,
    ne_lng: m.getBounds().getNorthEast().lng,
    sw_lat: m.getBounds().getSouthWest().lat,
    sw_lng: m.getBounds().getSouthWest().lng,
  })

  const map = useMapEvents({
    moveend: () => onBoundsChange(getBounds(map)),
    zoomend: () => onBoundsChange(getBounds(map)),
  })

  React.useEffect(() => {
    onBoundsChange(getBounds(map))
  }, [])

  return null
}

export default function SearchMap({ initialViewState, height, onBoundsChange, children }: Props) {
  return (
    <Map
      initialViewState={initialViewState}
      height={typeof height === 'number' ? `${height}px` : height}
    >
      <MapFlyController />
      <BoundsWatcher onBoundsChange={onBoundsChange} />
      <ShowGarages />
      <Panel position="right-center">
        <DefaultZoomControls />
      </Panel>
      {children}
    </Map>
  )
}
