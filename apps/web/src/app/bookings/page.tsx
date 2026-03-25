import { ListCustomerBookings } from '@parkit/ui/src/components/templates/ListCustomerBookings'
import { IsLoggedIn } from '@parkit/ui/src/components/organisms/IsLoggedIn'

export default function Page() {
  return (
    <IsLoggedIn>
      <ListCustomerBookings />
    </IsLoggedIn>
  )
}
