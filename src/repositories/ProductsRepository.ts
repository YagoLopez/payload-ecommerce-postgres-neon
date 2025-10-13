import type { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'

type FindAllOptions = {
  searchValue?: string | string[]
  sort?: string | string[]
  category?: string | string[]
}


export class ProductsRepository {

  static async getBySlug({ slug }: { slug: string }): Promise<Product | null> {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })


    const result = await payload.find({
      collection: 'products',
      depth: 3,
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
      populate: {
        variants: {
          title: true,
          priceInUSD: true,
          inventory: true,
          options: true,
        },
      },
    })

    return result.docs?.[0] || null
  }

  static async getAll({ searchValue, sort, category }: FindAllOptions = {}) {

    const payload = await getPayload({ config: configPromise })

    return await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        gallery: true,
        categories: true,
        priceInUSD: true,
      },
      ...(sort ? { sort } : { sort: 'title' }),
      ...(searchValue || category
        ? {
            where: {
              and: [
                {
                  _status: {
                    equals: 'published',
                  },
                },
                ...(searchValue
                  ? [
                      {
                        or: [
                          {
                            title: {
                              like: searchValue,
                            },
                          },
                          {
                            description: {
                              like: searchValue,
                            },
                          },
                        ],
                      },
                    ]
                  : []),
                ...(category
                  ? [
                      {
                        categories: {
                          contains: category,
                        },
                      },
                    ]
                  : []),
              ],
            },
          }
        : {}),
    })
  }
}
