import { memo } from 'react'
import { SearchGaragesQuery } from '@parkit/network/src/gql/generated'
import { useKeypress } from '@parkit/util/hooks/keys'
import { useState } from 'react'
import { Marker } from '../map/MapMarker'
import { FormProviderBookSlot } from '@parkit/forms/src/bookSlot'
import { useWatch } from 'react-hook-form'
import { FormTypeSearchGarage } from '@parkit/forms/src/searchGarages'
import { BookSlotPopup } from '../BookSlotPopup'
import { ParkingIcon } from '../../atoms/ParkingIcon'
import {
  Dialog as HDialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import { IconX } from '@tabler/icons-react'

const GarageMarkerInner = ({
  marker,
}: {
  marker: SearchGaragesQuery['searchGarages'][number]
}) => {
  const [showPopup, setShowPopup] = useState(false)
  useKeypress(['Escape'], () => setShowPopup(false))

  const { endTime, startTime } = useWatch<FormTypeSearchGarage>()

  if (!marker.address?.lat || !marker.address.lng) {
    return null
  }

  return (
    <>
      {/* Fullscreen drawer */}
      <Transition appear show={showPopup} as={Fragment}>
        <HDialog
          as="div"
          className="relative z-[1000]"
          onClose={() => setShowPopup(false)}
        >
          {/* Backdrop */}
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

          {/* Full-screen panel sliding from right */}
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
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {marker.displayName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {marker.address?.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  <FormProviderBookSlot defaultValues={{ endTime, startTime }}>
                    <BookSlotPopup garage={marker} />
                  </FormProviderBookSlot>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </HDialog>
      </Transition>

      <Marker
        latitude={marker.address.lat}
        longitude={marker.address.lng}
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          setShowPopup((s) => !s)
        }}
      >
        <ParkingIcon />
      </Marker>
    </>
  )
}

export const GarageMarker = memo(GarageMarkerInner)
