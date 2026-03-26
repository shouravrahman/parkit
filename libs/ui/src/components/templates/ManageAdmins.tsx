'use client'
import { useTakeSkip } from '@parkit/util/hooks/pagination'
import { useMutation, useQuery } from '@apollo/client'
import { AdminsDocument } from '@parkit/network/src/gql/generated'
import { ShowData } from '../organisms/ShowData'
import { AdminCard } from '../organisms/admin/AdminCard'
import { RemoveAdminButton } from '../organisms/admin/RemoveAdminButton'
import { CreateAdmin } from '../organisms/admin/CreateAdmin'

export const ManageAdmins = () => {
  const { setSkip, setTake, skip, take } = useTakeSkip(0)

  const { data, loading } = useQuery(AdminsDocument, {
    variables: { skip, take },
  })

  return (
    <>
      <div className="flex justify-end mt-4">
        <CreateAdmin />
      </div>
      <ShowData
        loading={loading}
        pagination={{
          skip,
          take,
          resultCount: data?.admins.length,
          totalCount: data?.adminsCount,
          setSkip,
          setTake,
        }}
        title={'Manage admins'}
      >
        {data?.admins.map((admin) => (
          <AdminCard key={admin.uid} admin={admin}>
            <div className="flex justify-end">
              <RemoveAdminButton uid={admin.uid} />
            </div>
          </AdminCard>
        ))}
      </ShowData>
    </>
  )
}
