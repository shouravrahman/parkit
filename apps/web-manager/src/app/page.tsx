'use client'
import { IsLoggedIn } from '@parkit/ui/src/components/organisms/IsLoggedIn'
import { IsManager } from '@parkit/ui/src/components/organisms/IsManager'
import { ListGarages } from '@parkit/ui/src/components/organisms/ListGarages'

export default function Home() {
  return (
    <IsLoggedIn>
      <IsManager>
        {(companyId) => <ListGarages companyId={companyId} />}
      </IsManager>
    </IsLoggedIn>
  )
}
