import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'
import { adminOrReadOnly } from '@/access/adminOrReadOnly'
import { adminOnly } from '@/access/adminOnly'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: adminOnly,
    read: adminOrReadOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField('title', {
      slugOverrides: {
        required: true,
        admin: {
          position: undefined,
        },
      },
    }),
  ],
}
