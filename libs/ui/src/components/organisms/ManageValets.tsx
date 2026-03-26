import { SearchGaragesQuery } from '@parkit/network/src/gql/generated'
import { useState } from 'react'
import { toast } from '../molecules/Toast'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormTypeBookSlot } from '@parkit/forms/src/bookSlot'
import { Switch } from '../atoms/Switch'
import { Marker } from './map/MapMarker'
import { Map } from './map/Map'
import { ParkingIcon } from '../atoms/ParkingIcon'
import { Directions } from './Directions'
import { Panel } from './map/Panel'
import { DefaultZoomControls } from './map/ZoomControls'
import { IconArrowRight, IconMapPin, IconParking } from '@tabler/icons-react'
import { DivIcon } from 'leaflet'
import { Marker as RLMarker } from 'react-leaflet'
import { useMemo } from 'react'

// Labeled marker for pickup (green) and dropoff (purple)
const LabeledMarker = ({
  lat,
  lng,
  label,
  color,
  draggable,
  onDragEnd,
}: {
  lat: number
  lng: number
  label: string
  color: string
  draggable?: boolean
  onDragEnd?: (lngLat: { lat: number; lng: number }) => void
}) => {
  const icon = useMemo(
    () =>
      new DivIcon({
        html: `<div style="
          background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;
          width:32px;height:32px;transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:${draggable ? 'grab' : 'default'};
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:11px;font-weight:700;color:#fff;">${label}</span>
        </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    [color, label, draggable],
  )

  return (
    <RLMarker
      position={[lat, lng]}
      icon={icon}
      draggable={draggable}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng()
          onDragEnd?.({ lat, lng })
        },
      }}
    />
  )
}

const formatDistance = (meters?: number) => {
  if (!meters) return null
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export const ManageValets = ({
  garage,
}: {
  garage: SearchGaragesQuery['searchGarages'][number]
}) => {
  const [showValet, setShowValet] = useState(false)

  const { setValue } = useFormContext<FormTypeBookSlot>()
  const { valet } = useWatch<FormTypeBookSlot>()

  const lat = garage.address?.lat
  const lng = garage.address?.lng
  if (!lat || !lng) {
    toast('Garage location not set.')
    return <div>Something went wrong.</div>
  }

  const pickupDist = formatDistance(valet?.pickupInfo?.distance)
  const dropoffDist = formatDistance(valet?.dropoffInfo?.distance)

  return (
    <div className="space-y-3 border-t border-white/10 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Valet service</p>
          <p className="text-xs text-gray-500">
            We pick up &amp; return your car
          </p>
        </div>
        <Switch
          checked={showValet}
          onChange={(e) => {
            setShowValet(e)
            if (!e) {
              setValue('valet', undefined, { shouldValidate: true })
              setValue('valet.differentLocations', false)
            } else {
              setValue('valet.pickupInfo', { lat, lng })
              setValue('valet.dropoffInfo', { lat, lng })
            }
          }}
          label=""
        />
      </div>

      {showValet && (
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white/20" />
              <span className="text-gray-300">Pickup location</span>
              {pickupDist && (
                <span className="text-primary font-medium">{pickupDist}</span>
              )}
            </div>
            {valet?.differentLocations && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-black border border-white/20" />
                <span className="text-gray-300">Dropoff location</span>
                {dropoffDist && (
                  <span className="text-primary font-medium">
                    {dropoffDist}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#f59e0b] border border-white/20" />
              <span className="text-gray-300">Garage</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Drag the pin(s) to set your location(s)
          </p>

          {/* Different dropoff toggle */}
          <div className="flex items-center justify-between bg-dark-200 rounded-lg px-3 py-2.5 border border-white/10">
            <div>
              <p className="text-xs font-medium text-white">
                Different dropoff location?
              </p>
              <p className="text-[11px] text-gray-500">
                Return car to a different address
              </p>
            </div>
            <Switch
              checked={valet?.differentLocations || false}
              onChange={(e) => {
                setValue('valet.differentLocations', e)
                if (!e) {
                  setValue('valet.dropoffInfo', {
                    lat: valet?.pickupInfo?.lat || lat,
                    lng: valet?.pickupInfo?.lng || lng,
                  })
                } else {
                  setValue('valet.dropoffInfo', { lat, lng })
                }
              }}
              label=""
            />
          </div>

          {/* Route summary */}
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-dark-200 rounded-lg px-3 py-2 border border-white/10">
            <IconMapPin className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
            <span className="text-gray-300 truncate">Your pickup</span>
            <IconArrowRight className="w-3 h-3 shrink-0" />
            <IconParking className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-gray-300 truncate">Garage</span>
            {valet?.differentLocations && (
              <>
                <IconArrowRight className="w-3 h-3 shrink-0" />
                <IconMapPin className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                <span className="text-gray-300 truncate">Your dropoff</span>
              </>
            )}
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-white/10">
            <Map
              initialViewState={{ latitude: lat, longitude: lng, zoom: 13 }}
              height="400px"
            >
              <Panel position="right-center">
                <DefaultZoomControls />
              </Panel>

              {/* Garage marker */}
              <Marker latitude={lat} longitude={lng} variant="parking">
                <ParkingIcon />
              </Marker>

              {/* Pickup marker — green, draggable */}
              {valet?.pickupInfo?.lat && valet?.pickupInfo?.lng && (
                <>
                  <LabeledMarker
                    lat={valet.pickupInfo.lat}
                    lng={valet.pickupInfo.lng}
                    label="A"
                    color="#3b82f6"
                    draggable
                    onDragEnd={({ lat: newLat, lng: newLng }) => {
                      setValue('valet.pickupInfo.lat', newLat)
                      setValue('valet.pickupInfo.lng', newLng)
                      if (!valet.differentLocations) {
                        setValue('valet.dropoffInfo.lat', newLat)
                        setValue('valet.dropoffInfo.lng', newLng)
                      }
                    }}
                  />
                  <Directions
                    sourceId="pickup_route"
                    origin={{ lat, lng }}
                    destination={{
                      lat: valet.pickupInfo.lat,
                      lng: valet.pickupInfo.lng,
                    }}
                    color="#3b82f6"
                    setDistance={(d) =>
                      setValue('valet.pickupInfo.distance', d)
                    }
                  />
                </>
              )}

              {/* Dropoff marker — purple, only when different location */}
              {valet?.differentLocations &&
                valet?.dropoffInfo?.lat &&
                valet?.dropoffInfo?.lng && (
                  <>
                    <LabeledMarker
                      lat={valet.dropoffInfo.lat}
                      lng={valet.dropoffInfo.lng}
                      label="B"
                      color="#000000"
                      draggable
                      onDragEnd={({ lat: newLat, lng: newLng }) => {
                        setValue('valet.dropoffInfo.lat', newLat)
                        setValue('valet.dropoffInfo.lng', newLng)
                      }}
                    />
                    <Directions
                      sourceId="dropoff_route"
                      origin={{ lat, lng }}
                      destination={{
                        lat: valet.dropoffInfo.lat,
                        lng: valet.dropoffInfo.lng,
                      }}
                      color="#000000"
                      setDistance={(d) =>
                        setValue('valet.dropoffInfo.distance', d)
                      }
                    />
                  </>
                )}
            </Map>
          </div>
        </div>
      )}
    </div>
  )
}
