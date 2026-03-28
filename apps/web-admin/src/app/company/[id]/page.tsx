import { CompanyDetails } from '@parkit/ui/src/components/templates/CompanyDetails'
import { IsAdmin } from '@parkit/ui/src/components/organisms/IsAdmin'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <IsAdmin>
      <main className="min-h-screen  ">
        <CompanyDetails companyId={Number(params.id)} />
      </main>
    </IsAdmin>
  )
}
