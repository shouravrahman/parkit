import { MenuItem } from '@parkit/util/types'
import Link from 'next/link'

export interface IMenuItemProps {
  menuItems: MenuItem[]
}

export const Menus = ({ menuItems }: IMenuItemProps) => {
  return (
    <>
      {menuItems.map(({ label, href }) => (
        <Link
          className="w-full px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium border-l-2 border-transparent hover:border-primary"
          key={label}
          href={href}
        >
          {label}
        </Link>
      ))}
    </>
  )
}
