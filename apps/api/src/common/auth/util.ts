import { GetUserType, Role } from 'src/common/types'
import { ForbiddenException } from '@nestjs/common'

export const checkRowLevelPermission = (
  user: GetUserType,
  requestedUid?: string | string[],
  roles: Role[] = ['admin'],
  requestedCompanyId?: number,
) => {
  if (user.roles?.some((role) => roles.includes(role))) {
    return true
  }

  if (requestedCompanyId && user.companyId === requestedCompanyId) {
    return true
  }

  if (requestedUid) {
    const uids =
      typeof requestedUid === 'string'
        ? [requestedUid]
        : requestedUid.filter(Boolean)

    if (uids.includes(user.uid)) {
      return true
    }
  }

  throw new ForbiddenException()
}
