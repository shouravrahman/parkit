import { CompanyValetsQuery } from '@parkit/network/src/gql/generated'
import { format } from 'date-fns'
import Image from 'next/image'

export interface IValetCardProps {
  valet: CompanyValetsQuery['companyValets'][0]
}

export const ValetCard = ({ valet }: IValetCardProps) => {
  return (
    <div className="space-y-2 bg-dark-100 border border-white/10 rounded-xl p-3 hover:border-primary/30 transition-colors duration-300">
      <div className="p-1 border-2 border-primary/50 rounded-lg overflow-hidden">
        <Image
          className="object-cover w-full aspect-square rounded-md"
          width={200}
          height={300}
          src={valet.image || '/valet.jpeg'}
          alt={''}
        />
      </div>
      <div>
        <div className="font-semibold text-white">{valet.displayName}</div>
        <div className="mb-1 text-xs text-gray-400">{valet.uid}</div>
        <div className="mb-1 text-xs text-gray-400">{valet.licenceID}</div>
        <div className="text-xs text-gray-500">
          {format(new Date(valet.createdAt), 'PP')}
        </div>
      </div>
    </div>
  )
}
