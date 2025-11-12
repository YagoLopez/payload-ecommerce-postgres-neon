import type { Order, User } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config: configPromise })

export class OrdersRepository {
  static async getUserOrders(user: (User & { collection: 'users' }) | null): Promise<Order[]> {
    const result = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    return result?.docs || []
  }

  static async getOrderById(
    user:
      | (User & {
          collection: 'users'
        })
      | null,
    orderId: string | number,
  ): Promise<Order | null> {
    const result = await payload.find({
      collection: 'orders',
      limit: 1,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        and: [
          {
            customer: {
              equals: user?.id,
            },
          },
          {
            id: {
              equals: orderId,
            },
          },
        ],
      },
    })

    return result?.docs?.[0] || null
  }
}
