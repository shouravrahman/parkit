'use client'
import { useState } from 'react'
import { LocationInfo } from '@parkit/util/types'
import { Autocomplete } from '../../atoms/Autocomplete'
import { useSearchLocation } from '@parkit/util/hooks/location'
import { majorCitiesLocationInfo } from '@parkit/util/constants'
import { useMapFly } from './MapFlyContext'

export const SearchPlaceBoxSidebar = () => {
  const flyRef = useMapFly()
  const [selected, setSelected] = useState<LocationInfo | null>(null)
  const { loading, locationInfo, searchText, setLoading, setSearchText } =
    useSearchLocation()

  return (
    <Autocomplete<LocationInfo>
      value={selected}
      options={locationInfo?.length ? locationInfo : majorCitiesLocationInfo}
      isOptionEqualToValue={(option, value) =>
        option.placeName === value.placeName
      }
      noOptionsText={searchText ? 'No options.' : 'Type something...'}
      getOptionLabel={(x) => x.placeName}
      onInputChange={(_, v) => {
        setLoading(true)
        setSearchText(v)
      }}
      loading={loading}
      onChange={(_, v) => {
        setSelected(v)
        if (v) {
          flyRef.current?.(v.latLng[0], v.latLng[1], 13, v.boundingbox)
        }
      }}
    />
  )
}
