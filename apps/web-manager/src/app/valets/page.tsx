import { ManageValets } from '@parkit/ui/src/components/templates/ManageValets'
import { IsLoggedIn } from '@parkit/ui/src/components/organisms/IsLoggedIn'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <IsLoggedIn>
      <ManageValets />
    </IsLoggedIn>
  )
}
