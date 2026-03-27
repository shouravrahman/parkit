import { memo, useState } from 'react'
import {
  SearchGaragesQuery,
  SlotAvailabilityChangedDocument,
  SlotAvailabilityChangedSubscription,
  SlotAvailabilityChangedSubscriptionVariables,
} from '@parkit/network/src/gql/generated'
import { useKeypress } from '@parkit/util/hooks/keys'
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
import { useSubscription } from '@parkit/network/src/config/apollo-hooks'

const GarageMarkerInner = ({
  marker,
}: {
  marker: SearchGaragesQuery['searchGarages'][number]
}) => {
  const [showPopup, setShowPopup] = useState(false)
  useKeypress(['Escape'], () => setShowPopup(false))

  const { endTime, startTime } = useWatch<FormTypeSearchGarage>()

  const { data: liveData } = useSubscription<
    SlotAvailabilityChangedSubscription,
    SlotAvailabilityChangedSubscriptionVariables
  >(SlotAvailabilityChangedDocument, {
    variables: { garageId: marker.id },
  })

  const liveSlots = liveData?.slotAvailabilityChanged?.availableSlots
  const displaySlots = liveSlots ?? marker.availableSlots
  const totalAvailable = displaySlots.reduce((sum, s) => sum + s.count, 0)
  const isAvailable = totalAvailable > 0

  if (!marker.address?.lat || !marker.address.lng) return null

  const mergedMarker = (liveSlots
    ? { ...marker, availableSlots: liveSlots as typeof marker.availableSlots }
    : marker) as SearchGaragesQuery["searchGarages"][number]

  return (
    <>
      <Transition appear show={showPopup} as={Fragment}>
        <HDialog
          as="div"
          className="relative z-[1000]"
          onClose={() => setShowPopup(false)}
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
                      {marker.displayName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {marker.address?.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${
                        isAvailable
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          isAvailable ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                      {isAvailable ? `${totalAvailable} slots` : 'Full'}
                    </span>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  <FormProviderBookSlot defaultValues={{ endTime, startTime }}>
                    <BookSlotPopup garage={mergedMarker} />
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
        <div className="relative">
          <ParkingIcon />
          <span
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-dark ${
              isAvailable ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
        </div>
      </Marker>
    </>
  )
}

export const GarageMarker = memo(GarageMarkerInner)
