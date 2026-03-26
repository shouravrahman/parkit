'use client'
import { IsLoggedIn } from '@parkit/ui/src/components/organisms/IsLoggedIn'
import { IsValet } from '@parkit/ui/src/components/organisms/IsValet'
import { ValetHome } from '@parkit/ui/src/components/templates/ValetHome'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main>
      <IsLoggedIn>
        {(uid) => (
          <IsValet uid={uid}>
            <ValetHome />
          </IsValet>
        )}
      </IsLoggedIn>
    </main>
  )
}
