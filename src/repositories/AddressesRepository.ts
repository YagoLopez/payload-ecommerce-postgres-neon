import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config: configPromise })

export class AddressesRepository {
  static async getByCustomer({ customerId }: { customerId?: number | string }) {
    if (!customerId) {
      return {
        docs: [],
        totalDocs: 0,
        limit: 0,
        totalPages: 1,
        page: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      }
    }

    return await payload.find({
      collection: 'addresses',
      draft: false,
      overrideAccess: true,
      select: {
        title: true,
        firstName: true,
        lastName: true,
        company: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
        updatedAt: true,
        createdAt: true,
      },
      sort: '-createdAt',
      where: {
        customer: { equals: typeof customerId === 'string' ? parseInt(customerId, 10) : customerId },
      },
    })
  }}
