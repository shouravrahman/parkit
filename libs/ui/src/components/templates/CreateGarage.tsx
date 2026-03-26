'use client'
import {
  FormProviderCreateGarage,
  FormTypeCreateGarage,
} from '@parkit/forms/src/createGarage'
import { useMutation } from '@apollo/client'
import { useCloudinaryUpload } from '@parkit/util/hooks/cloudinary'
import {
  CreateGarageDocument,
  namedOperations,
} from '@parkit/network/src/gql/generated'
import { Form } from '../atoms/Form'
import { HtmlLabel } from '../atoms/HtmlLabel'
import { HtmlInput } from '../atoms/HtmlInput'
import { Button } from '../atoms/Button'
import { HtmlTextArea } from '../atoms/HtmlTextArea'
import { ImagePreview } from '../organisms/ImagePreview'
import { Controller, useFormContext } from 'react-hook-form'
import { Map, useMap } from '../organisms/map/Map'
import { initialViewState } from '@parkit/util/constants'
import { Panel } from '../organisms/map/Panel'
import { CenterOfMap, DefaultZoomControls } from '../organisms/map/ZoomControls'
import { AddSlots, GarageMapMarker } from '../organisms/CreateGarageComponents'
import { toast } from '../molecules/Toast'
import { IconPhoto } from '@tabler/icons-react'
import { useDebounce } from '@parkit/util/hooks/async'
import { useEffect } from 'react'

const SectionCard = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
      {title}
    </h3>
    {children}
  </div>
)

// Syncs map position when lat/lng form values change
const MapSync = () => {
  const map = useMap()
  const { watch } = useFormContext<FormTypeCreateGarage>()
  const lat = watch('location.lat')
  const lng = watch('location.lng')

  useEffect(() => {
    if (lat && lng && map) {
      map.flyTo([lat, lng], 15)
    }
  }, [lat, lng, map])

  return null
}

const CreateGarageContent = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
    resetField,
    watch,
  } = useFormContext<FormTypeCreateGarage>()

  const { images } = watch()
  const addressValue = watch('location.address')
  const [debouncedAddress] = useDebounce(addressValue, 600)

  // Geocode the address field and update lat/lng
  useEffect(() => {
    if (!debouncedAddress || debouncedAddress.length < 5) return
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedAddress)}&format=json&limit=1`,
      { headers: { Accept: 'application/json' } },
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setValue('location.lat', parseFloat(data[0].lat), {
            shouldValidate: true,
          })
          setValue('location.lng', parseFloat(data[0].lon), {
            shouldValidate: true,
          })
        }
      })
      .catch(() => {})
  }, [debouncedAddress, setValue])

  const { uploading, upload } = useCloudinaryUpload()

  const [createGarage, { loading }] = useMutation(CreateGarageDocument, {
    refetchQueries: [namedOperations.Query.Garages],
    onCompleted: () => {
      reset()
      toast('Garage created successfully.')
    },
    onError() {
      toast('Action failed.')
    },
  })

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <Form
        onSubmit={handleSubmit(
          async ({ images, description, displayName, location, slotTypes }) => {
            const uploadedImages = await upload(images)
            await createGarage({
              variables: {
                createGarageInput: {
                  Address: location,
                  images: uploadedImages,
                  Slots: slotTypes,
                  description,
                  displayName,
                },
              },
            })
          },
        )}
        className="flex flex-col gap-3"
      >
        <SectionCard title="Basic Info">
          <div className="flex flex-col gap-3">
            <HtmlLabel error={errors.displayName?.message} title="Garage name">
              <HtmlInput
                {...register('displayName')}
                placeholder="e.g. Downtown Parking Hub"
              />
            </HtmlLabel>
            <HtmlLabel title="Description" error={errors.description?.message}>
              <HtmlTextArea
                rows={3}
                {...register('description')}
                placeholder="Describe your garage — location highlights, security, amenities..."
              />
            </HtmlLabel>
          </div>
        </SectionCard>

        <SectionCard title="Location">
          <HtmlLabel
            title="Street address"
            error={errors.location?.address?.message}
          >
            <HtmlTextArea
              rows={2}
              {...register('location.address')}
              placeholder="e.g. Zindabazar, Sylhet"
            />
          </HtmlLabel>
          <p className="text-xs text-gray-500 mt-2">
            Map updates automatically. Drag the marker to fine-tune.
          </p>
        </SectionCard>

        <SectionCard title="Photos">
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <ImagePreview
                srcs={images}
                clearImage={() => resetField('images')}
              >
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group">
                  <IconPhoto className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors mb-2" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300">
                    Click to upload images
                  </span>
                  <span className="text-xs text-gray-600 mt-1">
                    PNG, JPG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => field.onChange(e?.target?.files)}
                  />
                </label>
              </ImagePreview>
            )}
          />
        </SectionCard>

        <SectionCard title="Parking Slots">
          <AddSlots />
        </SectionCard>

        <Button
          loading={uploading || loading}
          type="submit"
          fullWidth
          size="lg"
        >
          Create Garage
        </Button>
      </Form>

      {/* Right: Map — no search box, driven by address field */}
      <div className="rounded-xl overflow-hidden border border-white/10 h-[600px] md:h-auto md:sticky md:top-4">
        <Map
          initialViewState={initialViewState}
          onLoad={(e) => {
            const { lat, lng } = e.target.getCenter()
            setValue('location.lat', lat)
            setValue('location.lng', lng)
          }}
        >
          <MapSync />
          <GarageMapMarker />
          <Panel position="right-top">
            <DefaultZoomControls>
              <CenterOfMap
                onClick={(latLng) => {
                  setValue('location.lat', parseFloat(latLng.lat.toFixed(8)), {
                    shouldValidate: true,
                  })
                  setValue('location.lng', parseFloat(latLng.lng.toFixed(8)), {
                    shouldValidate: true,
                  })
                }}
              />
            </DefaultZoomControls>
          </Panel>
        </Map>
      </div>
    </div>
  )
}

export const CreateGarage = () => {
  return (
    <FormProviderCreateGarage>
      <CreateGarageContent />
    </FormProviderCreateGarage>
  )
}
