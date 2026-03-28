import { UserManagement } from '@parkit/ui/src/components/templates/UserManagement'
import { IsAdmin } from '@parkit/ui/src/components/organisms/IsAdmin'

export default function Page() {
  return (
    <IsAdmin>
      <main className="min-h-screen">
        <UserManagement />
      </main>
    </IsAdmin>
  )
}
