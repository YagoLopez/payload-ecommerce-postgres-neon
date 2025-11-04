import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Allows admin or read-only users to access data.
 * Read-only users can read data but not create, update, or delete.
 */
export const adminOrReadOnly: Access = ({ req: { user } }) => {
  if (user) {
    if (checkRole(['admin', 'read-only'], user)) {
      return true
    }

    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
