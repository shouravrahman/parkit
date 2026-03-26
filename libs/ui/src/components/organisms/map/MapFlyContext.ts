import { createContext, useContext, MutableRefObject } from 'react'

export type FlyToFn = (
    lat: number,
    lng: number,
    zoom?: number,
    boundingbox?: [string, string, string, string],
) => void

export const MapFlyContext = createContext<MutableRefObject<FlyToFn | null>>({
    current: null,
})

export const useMapFly = () => useContext(MapFlyContext)
