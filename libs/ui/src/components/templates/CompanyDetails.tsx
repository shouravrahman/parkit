'use client'
import { useQuery } from '@apollo/client'
import { CompanyDocument } from '@parkit/network/src/gql/generated'
import { GarageAdminCard } from '../organisms/GarageAdminCard'
import { ShowData } from '../organisms/ShowData'
import { InviteUser } from '../organisms/InviteUser'

export const CompanyDetails = ({ companyId }: { companyId: number }) => {
  const { data, loading, error } = useQuery(CompanyDocument, {
    variables: { where: { id: companyId } },
  })

  return (
    <ShowData loading={loading} error={error?.message} childrenClassName="block w-full">
      {data?.company && (
        <div className="space-y-12">
          {/* Header Section */}
          <div className="p-8 border border-white/10 rounded-2xl shadow-xl bg-white/5 backdrop-blur-sm">
            <h1 className="text-3xl font-extrabold text-white mb-2">
              {data.company.displayName}
            </h1>
            <p className="text-gray-400 max-w-2xl mb-6">
              {data.company.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
              <span className="uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
                ID: {data.company.id}
              </span>
              <span>
                Created: {new Date(data.company.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Garages Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Garages
              </h2>
            </div>
            {data.company.garages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.company.garages.map((garage: any) => (
                  <GarageAdminCard key={garage.id} garage={garage as any}>
                     <div className="mt-2 text-primary font-semibold text-sm w-full text-center">
                       <a href={`/garage/${garage.id}`} className="hover:underline">View Details →</a>
                     </div>
                  </GarageAdminCard>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No garages found for this company.</p>
            )}
          </section>

          {/* Personnel Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Managers (Tenants)</h2>
                <InviteUser companyId={companyId} role="MANAGER" />
              </div>
              {data.company.managers.length > 0 ? (
                <ul className="space-y-4">
                  {data.company.managers.map((manager: any) => (
                    <li key={manager.uid} className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                      <span className="text-white font-medium">{manager.displayName || 'Unnamed Manager'}</span>
                      <span className="text-xs text-gray-500 font-mono">UID: {manager.uid.slice(0, 8)}...</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No managers assigned.</p>
              )}
            </section>

            <section className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Valets</h2>
                <InviteUser companyId={companyId} role="VALET" />
              </div>
              {data.company.valets.length > 0 ? (
                <ul className="space-y-4">
                  {data.company.valets.map((valet: any) => (
                    <li key={valet.uid} className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        {valet.image ? (
                          <img src={valet.image} alt={valet.displayName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {valet.displayName?.charAt(0) || 'V'}
                          </div>
                        )}
                        <span className="text-white font-medium">{valet.displayName || 'Unnamed Valet'}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">UID: {valet.uid.slice(0, 8)}...</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No valets assigned.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </ShowData>
  )
}
