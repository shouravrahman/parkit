import { GaragesQuery } from '@parkit/network/src/gql/generated'
import { ReactNode } from 'react'
import { MapLink } from '../molecules/MapLink'
import { IconTypes } from '../molecules/IconTypes'

export const GarageAdminCard = ({
  children,
  garage,
}: {
  children: ReactNode
  garage: GaragesQuery['garages'][0]
}) => {
  return (
    <div className="bg-dark-100 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-600 font-mono mb-0.5">
            #{garage.id}
          </p>
          <h2 className="font-semibold text-white truncate">
            {garage.displayName}
          </h2>
        </div>
        {garage.verification?.verified ? (
          <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-green/15 text-green-300 border border-green/30">
            Verified
          </span>
        ) : (
          <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-red/15 text-red-400 border border-red/30">
            Not Verified
          </span>
        )}
      </div>

      {/* Address */}
      {garage.address && (
        <MapLink
          waypoints={[garage.address]}
          className="hover:underline underline-offset-4"
        >
          <p className="text-xs text-gray-400">{garage.address.address}</p>
        </MapLink>
      )}

      {/* Slot counts */}
      <div className="flex gap-2 flex-wrap">
        {garage.slotCounts.length === 0 ? (
          <span className="text-xs text-gray-600">No slots</span>
        ) : (
          garage.slotCounts.map((slot, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary"
            >
              {IconTypes[slot.type]}
              <span className="text-sm font-semibold">{slot.count}</span>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-1 border-t border-white/5">{children}</div>
    </div>
  )
}
