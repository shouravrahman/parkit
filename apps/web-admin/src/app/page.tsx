import { IsAdmin } from '@parkit/ui/src/components/organisms/IsAdmin'
import { AdminHome } from '@parkit/ui/src/components/templates/AdminHome'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main>
      <IsAdmin>
        <AdminHome />
      </IsAdmin>
    </main>
  )
}
