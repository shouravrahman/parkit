'use client'
import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useQuery } from '@apollo/client'
import { GaragesDocument } from '@parkit/network/src/gql/generated'
import { ShowData } from '../organisms/ShowData'
import { GarageAdminCard } from '../organisms/GarageAdminCard'
import { CreateVerificationButton } from '../organisms/admin/CreateVerificationButton'
import { RemoveVerificationButton } from '../organisms/admin/RemoveVerificationButton'

export const AdminHome = () => {
  return (
    <div className="space-y-12">
      <ShowCompanies />
      <ShowGarages />
    </div>
  )
}

import { CompaniesDocument } from '@parkit/network/src/gql/generated'
import { CreateCompany } from '../organisms/CreateCompany'
import { InviteUser } from '../organisms/InviteUser'

export const ShowCompanies = () => {
  const { setSkip, setTake, skip, take } = useTakeSkip()
  const { loading, data, error } = useQuery(CompaniesDocument, {
    variables: { skip, take },
  })

  return (
    <ShowData
      error={error?.message}
      title="Companies"
      loading={loading}
      pagination={{
        resultCount: data?.companies.length || 0,
        totalCount: data?.companies.length || 0, // Simplified for now
        setSkip,
        setTake,
        skip,
        take,
      }}
    >
      <div className="flex justify-end mb-4">
        <CreateCompany />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.companies.map((company) => (
          <div key={company.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-bold">{company.displayName}</h3>
            <p className="text-sm text-gray-500 mb-4">{company.description}</p>
            <div className="flex justify-end gap-2 text-xs">
              <InviteUser companyId={company.id} role={'MANAGER'} />
            </div>
          </div>
        ))}
      </div>
    </ShowData>
  )
}

export const ShowGarages = () => {
  const { setSkip, setTake, skip, take } = useTakeSkip()
  const { loading, data, error } = useQuery(GaragesDocument, {
    variables: { skip, take },
  })

  return (
    <ShowData
      error={error?.message}
      title="Garages"
      loading={loading}
      pagination={{
        resultCount: data?.garages.length || 0,
        totalCount: data?.garagesCount.count || 0,
        setSkip,
        setTake,
        skip,
        take,
      }}
    >
      {data?.garages.map((garage) => (
        <GarageAdminCard key={garage.id} garage={garage}>
          <div className="flex justify-end">
            {!garage?.verification?.verified ? (
              <CreateVerificationButton garageId={garage.id} />
            ) : (
              <RemoveVerificationButton garageId={garage.id} />
            )}
          </div>
        </GarageAdminCard>
      ))}
    </ShowData>
  )
}
