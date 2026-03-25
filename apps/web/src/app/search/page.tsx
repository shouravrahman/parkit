'use client'
import { SearchPage } from '@parkit/ui/src/components/templates/SearchPage'
import { FormProviderSearchGarage } from '@parkit/forms/src/searchGarages'

export default function Page() {
  return (
    <FormProviderSearchGarage>
      <SearchPage />
    </FormProviderSearchGarage>
  )
}
