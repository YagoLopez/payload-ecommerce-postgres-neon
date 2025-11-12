import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { OrderItem } from '@/components/OrderItem'
import { UsersRepository } from '@/repositories/UsersRepository'
import { OrdersRepository } from '@/repositories/OrdersRepository'
import { redirectIfUserNotLoggedIn } from '@/utilities/redirectIfUserNotLoggedIn'

export default async function Orders() {
  const user = await UsersRepository.getCurrentUser()
  redirectIfUserNotLoggedIn(user)
  let orders: Order[] = []

  try {
    orders = await OrdersRepository.getUserOrders(user)
  } catch (error) {
    console.error(error)
  }

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground w-full">
        <h1 className="text-3xl font-medium mb-8">Orders</h1>
        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className="">You have no orders.</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
