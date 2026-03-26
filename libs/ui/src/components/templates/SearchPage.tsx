'use client'
import { useCallback } from 'react'
import { Map } from '../organisms/map/Map'
import { Panel } from '../organisms/map/Panel'
import { DefaultZoomControls } from '../organisms/map/ZoomControls'
import { initialViewState } from '@parkit/util/constants'
import { SearchPlaceBox } from '../organisms/map/SearchPlacesBox'
import { useFormContext } from 'react-hook-form'
import { FormTypeSearchGarage } from '@parkit/forms/src/searchGarages'
import { IconType } from '../molecules/IconTypes'
import { IconArrowDown } from '@tabler/icons-react'
import { HtmlInput } from '../atoms/HtmlInput'
import { toLocalISOString } from '@parkit/util/date'
import { ShowGarages } from '../organisms/search/ShowGarages'
import { FilterSidebar } from '../organisms/search/FilterSidebar'
import { useMapEvents } from 'react-leaflet'

const BoundsWatcher = ({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: {
    ne_lat: number
    ne_lng: number
    sw_lat: number
    sw_lng: number
  }) => void
}) => {
  const map = useMapEvents({
    load: () => {
      const b = map.getBounds()
      onBoundsChange({
        ne_lat: b.getNorthEast().lat,
        ne_lng: b.getNorthEast().lng,
        sw_lat: b.getSouthWest().lat,
        sw_lng: b.getSouthWest().lng,
      })
    },
    dragend: () => {
      const b = map.getBounds()
      onBoundsChange({
        ne_lat: b.getNorthEast().lat,
        ne_lng: b.getNorthEast().lng,
        sw_lat: b.getSouthWest().lat,
        sw_lng: b.getSouthWest().lng,
      })
    },
    zoomend: () => {
      const b = map.getBounds()
      onBoundsChange({
        ne_lat: b.getNorthEast().lat,
        ne_lng: b.getNorthEast().lng,
        sw_lat: b.getSouthWest().lat,
        sw_lng: b.getSouthWest().lng,
      })
    },
  })
  return null
}

export const SearchPage = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<FormTypeSearchGarage>()

  const formData = watch()

  const handleBoundsChange = useCallback(
    (locationFilter: {
      ne_lat: number
      ne_lng: number
      sw_lat: number
      sw_lng: number
    }) => {
      setValue('locationFilter', locationFilter)
    },
    [setValue],
  )

  return (
    <Map initialViewState={initialViewState}>
      <BoundsWatcher onBoundsChange={handleBoundsChange} />
      <ShowGarages />
      <Panel position="left-top">
        <div className="flex flex-col items-stretch">
          <SearchPlaceBox />
          <div className="flex relative pl-1 flex-col mt-1 bg-white/40 items-center gap-1 backdrop-blur-sm">
            <div className="absolute left-[1px] top-1/2 -translate-y-1/2">
              <IconArrowDown className="p-1" />
            </div>
            <div className="flex gap-1 items-center">
              <IconType time={formData.startTime} />
              <HtmlInput
                type="datetime-local"
                className="w-full p-2 text-lg font-light border-0"
                min={toLocalISOString(new Date()).slice(0, 16)}
                {...register('startTime', {
                  onChange() {
                    trigger('startTime')
                    trigger('endTime')
                  },
                })}
              />
            </div>
            <div className="flex gap-1 items-center">
              <IconType time={formData.endTime} />
              <HtmlInput
                min={toLocalISOString(new Date()).slice(0, 16)}
                type="datetime-local"
                className="w-full p-2 text-lg font-light border-0"
                {...register('endTime', {
                  onChange() {
                    trigger('endTime')
                  },
                })}
              />
            </div>
          </div>
        </div>
      </Panel>
      <Panel position="right-center">
        <DefaultZoomControls />
      </Panel>
      {errors ? (
        <Panel position="center-bottom">
          {Object.entries(errors).map(([key, value]) => (
            <div className="text-red-800 p-2 shadow bg-white" key={key}>
              {key}: {(value as any).message}
            </div>
          ))}
        </Panel>
      ) : null}
      <Panel position="right-top">
        <FilterSidebar />
      </Panel>
    </Map>
  )
}
