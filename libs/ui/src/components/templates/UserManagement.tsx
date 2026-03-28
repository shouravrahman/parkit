'use client'
import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useQuery } from '@apollo/client'
import { UsersDocument } from '@parkit/network/src/gql/generated'
import { ShowData } from '../organisms/ShowData'

export const UserManagement = () => {
  const { setSkip, setTake, skip, take } = useTakeSkip(12)
  const { data, loading, error } = useQuery(UsersDocument, {
    variables: { skip, take },
  })

  return (
    <div className="mt-8">
      <ShowData
        error={error?.message}
        title={<span className="text-2xl font-bold text-white mb-6">Global User Directory</span>}
        loading={loading}
        pagination={{
            resultCount: data?.users.length || 0,
            totalCount: data?.users.length || 0, // Fallback since usersCount isn't directly exposed
            setSkip,
            setTake,
            skip,
            take,
        }}
        childrenClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6"
      >
        {data?.users.map((user) => {
            const role = user.admin ? 'Admin' : user.manager ? 'Manager' : user.valet ? 'Valet' : 'Customer'
            const roleColor = role === 'Admin' ? 'text-red-400 bg-red-400/10 border-red-400/20' 
                            : role === 'Manager' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                            : role === 'Valet' ? 'text-green-400 bg-green-400/10 border-green-400/20'
                            : 'text-gray-400 bg-gray-400/10 border-gray-400/20'
                            
            return (
            <div key={user.uid} className="p-6 border border-white/10 rounded-xl shadow-xl bg-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center w-full">
                    {user.image ? (
                        <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {user.name?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="w-full min-w-0">
                    <h3 className="font-bold text-white truncate text-ellipsis">{user.name || 'Unknown User'}</h3>
                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleColor}`}>
                        {role}
                    </span>
                    </div>
                </div>
                </div>
                
                <div className="space-y-2 mt-6 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-black/10">
                <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>UID:</span>
                    <span className="font-mono text-xs text-gray-500">{user.uid.slice(0,10)}...</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                    <span>Joined:</span>
                    <span className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {(user.manager?.companyId || user.valet?.companyId) && (
                    <div className="flex justify-between pt-2">
                      <span>Company ID:</span>
                      <span className="text-white font-mono">{user.manager?.companyId || user.valet?.companyId}</span>
                    </div>
                )}
                </div>
            </div>
            )
        })}
      </ShowData>
    </div>
  )
}
