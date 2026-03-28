'use client'
import { useQuery } from '@apollo/client'
import { CompaniesDocument } from '@parkit/network/src/gql/generated'
import { HtmlSelect } from '../atoms/HtmlSelect'
import { useSession } from 'next-auth/react'

export const TenantSelector = () => {
  const { data: session } = useSession()
  const uid = session?.user?.uid

  const { data, loading } = useQuery(CompaniesDocument, {
    variables: { where: { Managers: { some: { uid: { equals: uid } } } } },
    skip: !uid,
  })

  if (loading || !data?.companies || data.companies.length <= 1) return null

  const options = data.companies.map((c) => ({
    label: c.displayName || 'Unnamed Company',
    value: String(c.id),
  }))

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/50 uppercase font-bold tracking-wider">
        Company:
      </span>
      <HtmlSelect
        // value handled by session/context in real app
        onChange={(val: React.ChangeEvent<HTMLSelectElement>) => {
          // Logic to switch active tenant (e.g., update session or cookie)
          console.log('Switch to company', val.target.value)
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </HtmlSelect>
    </div>
  )
}
