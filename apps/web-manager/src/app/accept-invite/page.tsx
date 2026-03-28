import { AcceptInvite } from '@parkit/ui/src/components/organisms/AcceptInvite'
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md">
        <AcceptInvite />
      </div>
    </div>
  )
}
