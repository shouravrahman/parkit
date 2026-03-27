'use client'
import { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { initialViewState } from '@parkit/util/constants'
import { SearchPlaceBoxSidebar } from '../organisms/map/SearchPlacesBoxSidebar'
import { MapFlyContext, FlyToFn } from '../organisms/map/MapFlyContext'
import { useFormContext, Controller } from 'react-hook-form'
import {
  FormTypeSearchGarage,
  formDefaultValuesSearchGarages,
} from '@parkit/forms/src/searchGarages'
import {
  IconArrowDown,
  IconAdjustments,
  IconX,
  IconShieldCheck,
  IconSortAscending,
  IconSortDescending,
  IconList,
  IconMap,
} from '@tabler/icons-react'
import { IconType } from '../molecules/IconTypes'
import { toLocalISOString } from '@parkit/util/date'
const SearchMap = dynamic(
  () => import('../organisms/map/SearchMap').then((m) => m.default),
  { ssr: false },
)
import { RangeSlider } from '../molecules/RangeSlider'
import { ToggleButtonGroup, ToggleButton } from '../molecules/ToggleButtonGroup'
import { IconTypes } from '../molecules/IconTypes'
import { PulsingDot } from '../atoms/Dot'
import { SlotType } from '@parkit/network/src/gql/generated'
const GarageResultsList = dynamic(
  () => import('../organisms/search/GarageResultsList').then((m) => m.GarageResultsList),
  { ssr: false },
)

const Divider = () => <div className="border-t border-white/5" />

const SectionLabel = ({
  label,
  dirty,
  onReset,
}: {
  label: string
  dirty?: boolean
  onReset?: () => void
}) => (
  <div className="flex items-center justify-between mb-2">
    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest relative inline-flex items-center gap-1.5">
      {label}
      {dirty && <PulsingDot />}
    </span>
    {onReset && dirty && (
      <button
        type="button"
        onClick={onReset}
        className="text-[11px] text-primary hover:text-primary-400 transition-colors"
      >
        Reset
      </button>
    )}
  </div>
)

export const SearchPage = () => {
  const {
    register,
    setValue,
    watch,
    reset,
    getValues,
    control,
    formState: { errors, dirtyFields },
    trigger,
  } = useFormContext<FormTypeSearchGarage>()

  const formData = watch()
  const flyRef = useRef<FlyToFn | null>(null)

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

  const errorEntries = Object.entries(errors)
  const hasFilters = Object.keys(dirtyFields).some((k) =>
    [
      'types',
      'pricePerHour',
      'width',
      'height',
      'length',
      'verifiedOnly',
      'sortBy',
    ].includes(k),
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')

  return (
    <MapFlyContext.Provider value={flyRef}>
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-dark relative">
        {/* ── Sidebar ── */}
        <aside
          className={`${mobileOpen ? 'flex' : 'hidden'} md:flex w-full md:w-72 shrink-0 flex-col bg-dark-100 border-r border-white/10 overflow-y-auto absolute md:relative inset-0 z-[500] md:z-auto`}
        >
          {/* Mobile close */}
          <div className="flex md:hidden items-center justify-between px-4 pt-3 pb-2 border-b border-white/10">
            <span className="text-sm font-semibold text-white">
              Search & Filters
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* Location */}
          <div className="px-4 pt-4 pb-3 border-b border-white/5">
            <SectionLabel label="Location" />
            <SearchPlaceBoxSidebar />
          </div>

          {/* Time range */}
          <div className="px-4 py-3 border-b border-white/5">
            <SectionLabel label="Time range" />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 bg-dark-200 border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <IconType
                  time={formData.startTime}
                  className="text-primary shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider">
                    From
                  </span>
                  <input
                    type="datetime-local"
                    className="bg-transparent text-sm text-white outline-none w-full [color-scheme:dark]"
                    min={toLocalISOString(new Date()).slice(0, 16)}
                    {...register('startTime', {
                      onChange() {
                        trigger('startTime')
                        trigger('endTime')
                      },
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <IconArrowDown className="w-3.5 h-3.5 text-gray-600" />
              </div>

              <div className="flex items-center gap-2.5 bg-dark-200 border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <IconType
                  time={formData.endTime}
                  className="text-primary shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider">
                    To
                  </span>
                  <input
                    type="datetime-local"
                    className="bg-transparent text-sm text-white outline-none w-full [color-scheme:dark]"
                    min={toLocalISOString(new Date()).slice(0, 16)}
                    {...register('endTime', {
                      onChange() {
                        trigger('endTime')
                      },
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 flex-1 flex flex-col gap-4">
            <SectionLabel
              label="Filters"
              dirty={hasFilters}
              onReset={() =>
                reset({ ...getValues(), ...formDefaultValuesSearchGarages })
              }
            />

            {/* Verified only + Sort row */}
            <div className="flex items-center justify-between gap-2">
              <Controller
                name="verifiedOnly"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      value
                        ? 'border-primary/60 bg-primary/15 text-primary'
                        : 'border-white/10 bg-dark-200 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <IconShieldCheck className="w-3.5 h-3.5" />
                    Verified only
                  </button>
                )}
              />

              <Controller
                name="sortBy"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        value === 'price_asc'
                          ? 'price_desc'
                          : value === 'price_desc'
                            ? undefined
                            : 'price_asc',
                      )
                    }
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      value
                        ? 'border-primary/60 bg-primary/15 text-primary'
                        : 'border-white/10 bg-dark-200 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {value === 'price_desc' ? (
                      <IconSortDescending className="w-3.5 h-3.5" />
                    ) : (
                      <IconSortAscending className="w-3.5 h-3.5" />
                    )}
                    {value === 'price_asc'
                      ? 'Price ↑'
                      : value === 'price_desc'
                        ? 'Price ↓'
                        : 'Sort'}
                  </button>
                )}
              />
            </div>

            <Divider />

            {/* Vehicle type */}
            <Controller
              name="types"
              control={control}
              render={({
                field: { value = [], onChange },
                fieldState: { isDirty },
                formState: { defaultValues },
              }) => (
                <div>
                  <p className="text-xs text-gray-500 mb-1 relative inline-flex items-center gap-1.5">
                    Vehicle type {isDirty && <PulsingDot />}
                  </p>
                  <ToggleButtonGroup
                    value={value}
                    onChange={(_, v) => onChange(v.sort())}
                    aria-label="vehicle type"
                  >
                    {defaultValues?.types?.map((val: string | undefined) => {
                      if (!val) return null
                      const slotType = val as SlotType
                      return (
                        <ToggleButton
                          key={val}
                          value={slotType}
                          selected={value.includes(slotType)}
                        >
                          {IconTypes[slotType]}
                        </ToggleButton>
                      )
                    })}
                  </ToggleButtonGroup>
                </div>
              )}
            />

            <Divider />

            {/* Price */}
            <Controller
              name="pricePerHour"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { isDirty },
                formState: { defaultValues },
              }) => (
                <div>
                  <p className="text-xs text-gray-500 relative inline-flex items-center gap-1.5">
                    Price per hour {isDirty && <PulsingDot />}
                  </p>
                  <RangeSlider
                    min={defaultValues?.pricePerHour?.[0]}
                    max={defaultValues?.pricePerHour?.[1]}
                    value={value}
                    onChange={onChange}
                    valueLabelFormat={(v) => `$${v}`}
                    step={5}
                  />
                </div>
              )}
            />

            <Divider />

            {/* Width */}
            <Controller
              name="width"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { isDirty },
                formState: { defaultValues },
              }) => (
                <div>
                  <p className="text-xs text-gray-500 relative inline-flex items-center gap-1.5">
                    Width {isDirty && <PulsingDot />}
                  </p>
                  <RangeSlider
                    min={defaultValues?.width?.[0]}
                    max={defaultValues?.width?.[1]}
                    value={value}
                    onChange={onChange}
                    valueLabelFormat={(v) => `${v} ft`}
                    step={2}
                  />
                </div>
              )}
            />

            <Divider />

            {/* Height */}
            <Controller
              name="height"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { isDirty },
                formState: { defaultValues },
              }) => (
                <div>
                  <p className="text-xs text-gray-500 relative inline-flex items-center gap-1.5">
                    Height {isDirty && <PulsingDot />}
                  </p>
                  <RangeSlider
                    min={defaultValues?.height?.[0]}
                    max={defaultValues?.height?.[1]}
                    value={value}
                    onChange={onChange}
                    valueLabelFormat={(v) => `${v} ft`}
                    step={2}
                  />
                </div>
              )}
            />

            <Divider />

            {/* Length */}
            <Controller
              name="length"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { isDirty },
                formState: { defaultValues },
              }) => (
                <div>
                  <p className="text-xs text-gray-500 relative inline-flex items-center gap-1.5">
                    Length {isDirty && <PulsingDot />}
                  </p>
                  <RangeSlider
                    min={defaultValues?.length?.[0]}
                    max={defaultValues?.length?.[1]}
                    value={value}
                    onChange={onChange}
                    valueLabelFormat={(v) => `${v} ft`}
                    step={5}
                  />
                </div>
              )}
            />

            {/* Errors */}
            {errorEntries.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-auto">
                {errorEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="text-xs text-red-400 bg-red/10 border border-red/20 rounded-lg px-3 py-2"
                  >
                    {key}: {(value as any).message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile bottom bar */}
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-100 border border-white/20 text-white text-sm font-medium shadow-xl"
          >
            <IconAdjustments className="w-4 h-4 text-primary" />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setMobileView((v) => (v === 'map' ? 'list' : 'map'))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-100 border border-white/20 text-white text-sm font-medium shadow-xl"
          >
            {mobileView === 'map' ? (
              <IconList className="w-4 h-4 text-primary" />
            ) : (
              <IconMap className="w-4 h-4 text-primary" />
            )}
            {mobileView === 'map' ? 'List' : 'Map'}
          </button>
        </div>

        {/* ── Map ── */}
        <div
          className={`flex-1 relative ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}
        >
          <SearchMap
            initialViewState={initialViewState}
            height="100%"
            onBoundsChange={handleBoundsChange}
          />
        </div>

        {/* ── Results list (desktop right panel + mobile list view) ── */}
        <div
          className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-80 shrink-0 flex-col bg-dark-100 border-l border-white/10 overflow-y-auto relative z-10`}
        >
          <GarageResultsList />
        </div>
      </div>
    </MapFlyContext.Provider>
  )
}
