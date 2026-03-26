import { ListCustomerBookings } from '@parkit/ui/src/components/templates/ListCustomerBookings'
import { IsLoggedIn } from '@parkit/ui/src/components/organisms/IsLoggedIn'
import { Container } from '@parkit/ui/src/components/atoms/Container'

export default function Page() {
  return (
    <Container>
      <IsLoggedIn>
        <ListCustomerBookings />
      </IsLoggedIn>
    </Container>
  )
}
