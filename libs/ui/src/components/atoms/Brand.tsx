import { Role } from '@parkit/util/types'
import { BrandIcon } from './BrandIcon'

export interface IBrandProps {
  className?: string
  shortForm?: boolean
  type?: Role
}

export const Brand = ({
  shortForm = false,
  className,
  type = undefined,
}: IBrandProps) => {
  return (
    <div className={`grid place-items-center z-50 group cursor-pointer ${className}`}>
      {shortForm ? (
        <div className="flex items-center gap-1.5 text-xl font-display font-bold">
          <BrandIcon />
          <span className="text-gradient group-hover:tracking-widest transition-all duration-500">P.</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 font-display">
          <BrandIcon />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gradient tracking-tight">
                Parkit
              </span>
              {type ? (
                <span className="text-xs text-gray-400 font-medium border border-white/15 rounded px-1.5 py-0.5 bg-white/5">
                  {type}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
