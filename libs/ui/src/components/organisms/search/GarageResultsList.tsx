'use client'
import { useLazyQuery } from '@parkit/network/src/config/apollo-hooks'
import { SearchGaragesDocument } from '@parkit/network/src/gql/generated'
import { useConvertSearchFormToVariables } from '@parkit/forms/src/adapters/searchFormAdapter'
import { useEffect, useState } from 'react'
import { FormProviderBookSlot } from '@parkit/forms/src/bookSlot'
import { useWatch } from 'react-hook-form'
import { FormTypeSearchGarage } from '@parkit/forms/src/searchGarages'
import { BookSlotPopup } from '../BookSlotPopup'
import { IconShieldCheck, IconParking, IconX } from '@tabler/icons-react'
import {
  Dialog as HDialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import { SearchGaragesQuery } from '@parkit/network/src/gql/generated'

type Garage = SearchGaragesQuery['searchGarages'][number]

export const GarageResultsList = () => {
  const { variables } = useConvertSearchFormToVariables()
  const { endTime, startTime } = useWatch<FormTypeSearchGarage>()
  const [selected, setSelected] = useState<Garage | null>(null)

  const [searchGarages, { data, previousData, loading }] = useLazyQuery(
    SearchGaragesDocument,
  )

  useEffect(() => {
    if (variables) searchGarages({ variables })
  }, [variables])

  const garages = data?.searchGarages ?? previousData?.searchGarages ?? []

  return (
    <>
      {/* Drawer */}
      <Transition appear show={!!selected} as={Fragment}>
        <HDialog
          as="div"
          className="relative z-[1000]"
          onClose={() => setSelected(null)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 flex justify-end">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <DialogPanel className="w-full md:max-w-[50vw] h-full bg-dark-100 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {selected?.displayName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selected?.address?.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {selected && (
                    <FormProviderBookSlot
                      defaultValues={{ endTime, startTime }}
                    >
                      <BookSlotPopup garage={selected} />
                    </FormProviderBookSlot>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </HDialog>
      </Transition>

      {/* List header */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          {loading
            ? 'Searching...'
            : `${garages.length} garage${garages.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {loading && garages.length === 0 && (
          <div className="flex flex-col gap-2 p-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && garages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <IconParking className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">
              No garages found in this area
            </p>
            <p className="text-xs text-gray-600">
              Try adjusting your filters or moving the map
            </p>
          </div>
        )}

        {garages.map((garage) => {
          const minPrice = garage.availableSlots.length
            ? Math.min(...garage.availableSlots.map((s) => s.pricePerHour))
            : null
          const totalSlots = garage.availableSlots.reduce(
            (s, sl) => s + sl.count,
            0,
          )

          return (
            <button
              key={garage.id}
              onClick={() => setSelected(garage)}
              className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                      {garage.displayName}
                    </p>
                    {garage.verification?.verified && (
                      <IconShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {garage.address?.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        totalSlots > 0
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {totalSlots > 0 ? `${totalSlots} available` : 'Full'}
                    </span>
                    {garage.availableSlots.map((slot) => (
                      <span key={slot.type} className="text-xs text-gray-600">
                        {slot.type}
                      </span>
                    ))}
                  </div>
                </div>
                {minPrice !== null && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">
                      ${minPrice}
                    </p>
                    <p className="text-[10px] text-gray-600">/hr</p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
