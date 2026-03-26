import { useEffect, useState } from 'react'
import { LocationInfo } from '../types'
import { useDebounce } from './async'

export const useSearchLocation = () => {
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationInfo, setLocationInfo] = useState<LocationInfo[]>(() => [])

  const [debouncedSearchText] = useDebounce(searchText, 400)

  useEffect(() => {
    if (!debouncedSearchText || debouncedSearchText.length < 2) {
      setLocationInfo([])
      return
    }

    setLoading(true)

    // Using OpenStreetMap Nominatim API (free, no API key needed)
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedSearchText)}&format=json&limit=5`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        const filtered = data?.map((x: any) => ({
          placeName: x.display_name,
          latLng: [parseFloat(x.lat), parseFloat(x.lon)],
          boundingbox: x.boundingbox,
        }))

        setLocationInfo(filtered || [])
      })
      .catch((error) => {
        console.error('Location search error:', error)
        setLocationInfo([])
      })
      .finally(() => setLoading(false))
  }, [debouncedSearchText])

  return { loading, setLoading, searchText, setSearchText, locationInfo }
}
