import { ManageAdmins } from '@parkit/ui/src/components/templates/ManageAdmins'
import { IsAdmin } from '@parkit/ui/src/components/organisms/IsAdmin'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <IsAdmin>
      <ManageAdmins />
    </IsAdmin>
  )
}
