import type { Page } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'

const payload = await getPayload({ config: configPromise })

export class PagesRepository {
  static async getPageBySlug({ slug }: { slug: string }): Promise<Page | null> {
    const { isEnabled: draft } = await draftMode()

    const result = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          ...(draft ? [] : [{ _status: { equals: 'published' } }]),
        ],
      },
    })

    return result.docs?.[0] || null
  }
}