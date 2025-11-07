import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Allows admin or read-only users to access data, or allows users to access their own data as customers.
 * This enables read-only users to create addresses in the storefront while maintaining security.
 */
export const adminOrReadOnlyOrCustomerOwner: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin', 'read-only'], user)) {
    return true
  }

  if (user?.id) {
    return {
      customer: {
        equals: user.id,
      },
    }
  }

  return false
}
