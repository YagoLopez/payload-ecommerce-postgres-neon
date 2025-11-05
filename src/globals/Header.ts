import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { adminOrReadOnly } from '@/access/adminOrReadOnly'
import { adminOnly } from '@/access/adminOnly'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: adminOrReadOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
