'use client'
import { FormTypeBookSlot } from '@parkit/forms/src/bookSlot'
import { loadStripe } from '@stripe/stripe-js'
import {
  CreateBookingInput,
  SearchGaragesQuery,
} from '@parkit/network/src/gql/generated'
import { useFormContext, useWatch, Controller } from 'react-hook-form'
import { Form } from '../atoms/Form'
import { Badge } from '../atoms/Badge'
import { AutoImageChanger } from './AutoImageChanger'
import { DateRangeBookingInfo } from '../molecules/DateRangeBookingInfo'
import { HtmlLabel } from '../atoms/HtmlLabel'
import { Radio, RadioGroup } from '@headlessui/react'
import { IconTypes } from '../molecules/IconTypes'
import { FormError } from '../atoms/FormError'
import { HtmlInput } from '../atoms/HtmlInput'
import { toLocalISOString } from '@parkit/util/date'
import { useTotalPrice } from '@parkit/util/hooks/price'
import { Button } from '../atoms/Button'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { TotalPrice } from '@parkit/util/types'
import { ManageValets } from './ManageValets'
import { toast } from '../molecules/Toast'

export const BookSlotPopup = ({
  garage,
}: {
  garage: SearchGaragesQuery['searchGarages'][0]
}) => {
  const session = useSession()
  const uid = session.data?.user?.uid
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<FormTypeBookSlot>()

  const { startTime, endTime, type, valet } = useWatch<FormTypeBookSlot>()

  const pricePerHour = garage.availableSlots.find(
    (slot) => slot.type === type,
  )?.pricePerHour ?? 0

  const totalPriceObj = useTotalPrice({ pricePerHour })
  const totalPrice =
    totalPriceObj.parkingCharge +
    totalPriceObj.valetChargeDropoff +
    totalPriceObj.valetChargePickup

  const [booking, setBooking] = useState(false)

  return (
    <div className="px-5 py-4">
      <Form
        onSubmit={handleSubmit(async (data) => {
          if (!uid) {
            toast('You are not logged in.')
            return
          }
          const bookingData: CreateBookingInput = {
            phoneNumber: data.phoneNumber,
            customerId: uid,
            endTime: data.endTime,
            startTime: data.startTime,
            type: data.type,
            garageId: garage.id,
            vehicleNumber: data.vehicleNumber,
            totalPrice,
            pricePerHour,
            ...(data.valet?.pickupInfo && data.valet?.dropoffInfo
              ? {
                  valetAssignment: {
                    pickupLat: data.valet.pickupInfo.lat,
                    pickupLng: data.valet.pickupInfo.lng,
                    returnLat: data.valet.dropoffInfo.lat,
                    returnLng: data.valet.dropoffInfo.lng,
                  },
                }
              : {}),
          }
          try {
            setBooking(true)
            await createBookingSession(uid, totalPriceObj, bookingData)
          } catch {
            toast('An error occurred while creating the booking session.')
          } finally {
            setBooking(false)
          }
        })}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {garage.displayName}
            </h2>
            <p className="text-sm text-gray-400">{garage.address?.address}</p>
          </div>
          {garage.verification?.verified ? (
            <Badge variant="green" size="sm">
              Verified
            </Badge>
          ) : (
            <Badge variant="gray" size="sm">
              Unverified
            </Badge>
          )}
        </div>

        {/* Image */}
        {garage.images?.length ? (
          <div className="rounded-xl overflow-hidden mb-4">
            <AutoImageChanger
              images={garage.images}
              durationPerImage={10000}
              aspectRatio="aspect-video"
              noAutoChange
            />
          </div>
        ) : null}

        <DateRangeBookingInfo startTime={startTime} endTime={endTime} />

        {/* Slot type */}
        <div className="mt-4">
          <HtmlLabel title="Slot type" error={errors.type?.message}>
            <Controller
              name="type"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  value={value || ''}
                  onChange={onChange}
                  className="flex flex-wrap gap-2 mt-1"
                >
                  {garage.availableSlots.map((slot) => (
                    <Radio key={slot.type} value={slot.type}>
                      {({ checked }) => (
                        <div
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${
                            checked
                              ? 'border-primary/60 bg-primary/15 text-primary'
                              : 'border-white/10 bg-dark-200 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {slot.type ? IconTypes[slot.type] : null}
                            <span className="font-semibold">
                              ${slot.pricePerHour}
                              <span className="text-xs font-normal opacity-60">
                                /hr
                              </span>
                            </span>
                          </div>
                          <div className="text-xs mt-0.5 opacity-60">
                            {slot.count} available
                          </div>
                        </div>
                      )}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            />
          </HtmlLabel>
          {!type && <FormError error="Select a slot type" />}
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <HtmlLabel title="Start time" error={errors.startTime?.message}>
            <HtmlInput
              type="datetime-local"
              min={toLocalISOString(new Date()).slice(0, 16)}
              {...register('startTime')}
            />
          </HtmlLabel>
          <HtmlLabel title="End time" error={errors.endTime?.message}>
            <HtmlInput
              type="datetime-local"
              min={toLocalISOString(new Date()).slice(0, 16)}
              {...register('endTime')}
            />
          </HtmlLabel>
        </div>

        {/* Vehicle & phone */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <HtmlLabel
            title="Vehicle number"
            error={errors.vehicleNumber?.message}
          >
            <HtmlInput
              placeholder="KA01AB1234"
              {...register('vehicleNumber')}
            />
          </HtmlLabel>
          <HtmlLabel title="Phone number" error={errors.phoneNumber?.message}>
            <HtmlInput
              placeholder="+910000000000"
              {...register('phoneNumber')}
            />
          </HtmlLabel>
        </div>

        {/* Valet */}
        <div className="mt-4">
          <ManageValets garage={garage} />
        </div>

        {/* Pricing */}
        {type && (
          <div className="mt-4 rounded-xl bg-dark-200 border border-white/10 p-3 space-y-2">
            <PriceLine label="Parking" amount={totalPriceObj.parkingCharge} />
            <PriceLine
              label="Valet pickup"
              amount={totalPriceObj.valetChargePickup}
            />
            <PriceLine
              label="Valet dropoff"
              amount={totalPriceObj.valetChargeDropoff}
            />
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-primary text-lg">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <Button loading={booking} type="submit" fullWidth className="mt-4">
          Book now
        </Button>
      </Form>
    </div>
  )
}

const PriceLine = ({ label, amount }: { label: string; amount: number }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="text-white">${amount.toFixed(2)}</span>
  </div>
)

export const createBookingSession = async (
  uid: string,
  totalPriceObj: TotalPrice,
  bookingData: CreateBookingInput,
) => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalPriceObj, uid, bookingData }),
  })
  const checkoutSession = await response.json()
  const stripe = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  )
  return stripe?.redirectToCheckout({ sessionId: checkoutSession.sessionId })
}
