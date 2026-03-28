import { CompanyDetails } from '@parkit/ui/src/components/templates/CompanyDetails'
import { IsAdmin } from '@parkit/ui/src/components/organisms/IsAdmin'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <IsAdmin>
      <main className="min-h-screen bg-black/95">
        <CompanyDetails companyId={Number(params.id)} />
      </main>
    </IsAdmin>
  )
}
