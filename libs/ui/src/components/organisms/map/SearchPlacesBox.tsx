'use client'
import { LocationInfo, ViewState } from '@parkit/util/types'
import { useMap } from 'react-leaflet'
import { Autocomplete } from '../../atoms/Autocomplete'
import { useSearchLocation } from '@parkit/util/hooks/location'
import { majorCitiesLocationInfo } from '@parkit/util/constants'

export const SearchPlaceBox = ({
  onLocationChange,
}: {
  onLocationChange?: (location: ViewState & { placeName?: string }) => void
}) => {
  const map = useMap()
  const { loading, locationInfo, searchText, setLoading, setSearchText } =
    useSearchLocation()

  return (
    <Autocomplete<LocationInfo>
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
      onChange={async (_, v) => {
        if (v) {
          const { latLng, placeName } = v
          map.flyTo([latLng[0], latLng[1]], 14)
          onLocationChange?.({
            latitude: latLng[0],
            longitude: latLng[1],
            placeName,
          })
        }
      }}
    />
  )
}
