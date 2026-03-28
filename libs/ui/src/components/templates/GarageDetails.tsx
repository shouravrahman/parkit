'use client'
import { useQuery } from '@apollo/client'
import { GarageDocument } from '@parkit/network/src/gql/generated'
import { ShowData } from '../organisms/ShowData'
import { MapLink } from '../molecules/MapLink'
import { IconTypes } from '../molecules/IconTypes'
import { CreateVerificationButton } from '../organisms/admin/CreateVerificationButton'
import { RemoveVerificationButton } from '../organisms/admin/RemoveVerificationButton'

export const GarageDetails = ({ garageId }: { garageId: number }) => {
  const { data, loading, error } = useQuery(GarageDocument, {
    variables: { where: { id: garageId } },
  })

  return (
    <ShowData loading={loading} error={error?.message} childrenClassName="block w-full">
      {data?.garage && (
        <div className="space-y-8">
          {/* Header */}
          <div className="p-8 border border-white/10 rounded-2xl shadow-xl bg-white/5 backdrop-blur-sm relative overflow-hidden">
            <div className="z-10 relative">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-extrabold text-white">
                  {data.garage.displayName}
                </h1>
                <div className="flex items-center gap-3">
                  {data.garage.verification?.verified ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-sm rounded-full bg-green/15 text-green-300 border border-green/30 font-semibold">
                        Verified
                      </span>
                      <RemoveVerificationButton 
                        garageId={data.garage.id} 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 text-sm rounded-full bg-red/15 text-red-400 border border-red/30 font-semibold">
                        Unverified
                      </span>
                      <CreateVerificationButton garageId={data.garage.id} />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-400 max-w-3xl mb-6">
                {data.garage.description}
              </p>
              
              <div className="flex gap-4 items-center">
                <span className="text-sm px-3 py-1 bg-black/20 rounded-lg text-gray-500 font-mono">
                  Garage ID: {data.garage.id}
                </span>
                <span className="text-sm px-3 py-1 bg-black/20 rounded-lg text-gray-500">
                  Company: <span className="text-white">{data.garage.company.displayName}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
               {/* Location */}
              <section className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4">Location</h2>
                {data.garage.address ? (
                  <MapLink waypoints={[data.garage.address]}>
                    <div className="p-4 bg-black/20 rounded-xl hover:bg-black/40 transition-colors border border-transparent hover:border-primary/50 cursor-pointer">
                      <p className="text-white text-lg">{data.garage.address.address}</p>
                      <p className="text-sm text-gray-500 mt-2 font-mono">
                        {data.garage.address.lat}, {data.garage.address.lng}
                      </p>
                    </div>
                  </MapLink>
                ) : (
                  <p className="text-gray-500 italic">No address provided.</p>
                )}
              </section>

              {/* Slot Counts */}
              <section className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4">Capacity Overview</h2>
                {data.garage.slotCounts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {data.garage.slotCounts.map((slot: any, idx: number) => (
                       <div key={idx} className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-primary gap-2">
                         <div className="text-2xl">{IconTypes[slot.type as keyof typeof IconTypes]}</div>
                         <div className="text-2xl font-black">{slot.count}</div>
                         <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{slot.type}</div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No slots defined for this garage.</p>
                )}
              </section>
            </div>

            {/* Right Column / Images */}
            <div className="space-y-8">
               <section className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm h-full">
                <h2 className="text-xl font-bold text-white mb-4">Gallery</h2>
                 {data.garage.images && data.garage.images.length > 0 ? (
                    <div className="space-y-4">
                      {data.garage.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-white/10">
                          <img src={img} alt={`Garage image ${idx + 1}`} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-black/20 rounded-xl border border-dashed border-white/20 text-gray-500">
                      No images uploaded
                    </div>
                 )}
               </section>
            </div>
          </div>
        </div>
      )}
    </ShowData>
  )
}
