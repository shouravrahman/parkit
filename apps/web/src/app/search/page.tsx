'use client'
import { SearchPage } from '@parkit/ui/src/components/templates/SearchPage'
import { FormProviderSearchGarage } from '@parkit/forms/src/searchGarages'
import { Container } from '@parkit/ui/src/components/atoms/Container'

export default function Page() {
  return (
    <Container>
      <FormProviderSearchGarage>
        <SearchPage />
      </FormProviderSearchGarage>
    </Container>
  )
}
