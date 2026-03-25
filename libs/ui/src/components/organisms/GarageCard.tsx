import { GaragesQuery } from '@parkit/network/src/gql/generated'
import { AutoImageChanger } from './AutoImageChanger'
import Link from 'next/link'
import { IconTypes } from '../molecules/IconTypes'
import { CreateManySlotsDialog } from './CreateManySlotsDialog'

export interface IGarageCardProps {
  garage: GaragesQuery['garages'][number]
}

export const GarageCard = ({ garage }: IGarageCardProps) => {
  return (
    <div className="overflow-hidden bg-dark-100 border border-white/10 rounded-xl shadow-xl flex flex-col hover:border-primary/30 transition-colors duration-300">
      <AutoImageChanger images={garage.images || []} durationPerImage={5000} />

      <div className="p-4 flex-grow flex flex-col gap-4">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-white">{garage.displayName}</h3>
            <Link
              className="text-xs text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4"
              href={{ pathname: 'bookings', query: { garageId: garage.id } }}
            >
              Bookings
            </Link>
          </div>
          <p className="text-gray-400 text-sm my-2 line-clamp-2">
            {garage.description}
          </p>
          <p className="text-sm text-gray-500">{garage.address?.address}</p>
        </div>
        <div className="flex gap-2 mt-auto flex-wrap">
          <>
            {garage.slotCounts.map((slotType) => (
              <div
                key={slotType.type}
                className="flex items-center justify-center w-16 h-10 gap-1 border border-primary/50 rounded-lg bg-primary/10 text-primary"
              >
                <div>{IconTypes[slotType.type]}</div>
                <div className="text-sm font-semibold">{slotType.count}</div>
              </div>
            ))}
            <CreateManySlotsDialog garageId={garage.id} />
          </>
        </div>
      </div>
    </div>
  )
}
