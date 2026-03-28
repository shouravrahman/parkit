import { GarageDetails } from '@parkit/ui/src/components/templates/GarageDetails'
import { IsAdmin } from '@parkit/ui/src/components/organisms/IsAdmin'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <IsAdmin>
      <main className="min-h-screen bg-black/95 p-8">
        <GarageDetails garageId={Number(params.id)} />
      </main>
    </IsAdmin>
  )
}
