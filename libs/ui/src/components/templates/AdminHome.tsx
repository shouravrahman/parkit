'use client'
import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useQuery } from '@apollo/client'
import { GaragesDocument } from '@parkit/network/src/gql/generated'
import { ShowData } from '../organisms/ShowData'
import { GarageAdminCard } from '../organisms/GarageAdminCard'
import { CreateVerificationButton } from '../organisms/admin/CreateVerificationButton'
import { RemoveVerificationButton } from '../organisms/admin/RemoveVerificationButton'
import Link from 'next/link'

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.companies.map((company) => (
          <div
            key={company.id}
            className="p-6 border border-white/10 rounded-xl shadow-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group"
          >
            <Link href={`/company/${company.id}`}>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {company.displayName}
              </h3>
            </Link>
            <p className="text-sm text-gray-400 mt-2 mb-6 line-clamp-2">
              {company.description}
            </p>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                ID: {String(company.id).slice(0, 8)}...
              </span>
              <div className="flex gap-2">
                <InviteUser companyId={company.id} role={'MANAGER'} />
              </div>
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
