import { IsLoggedIn } from '@parkit/ui/src/components/organisms/IsLoggedIn'
import { IsManager } from '@parkit/ui/src/components/organisms/IsManager'
import { ListGarageBookings } from '@parkit/ui/src/components/templates/ListGarageBookings'

export const dynamic = 'force-dynamic'

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const garageId = Number(searchParams['garageId'])

  return (
    <main>
      <IsLoggedIn>
        <IsManager>
          <ListGarageBookings garageId={garageId} />
        </IsManager>
      </IsLoggedIn>
    </main>
  )
}
