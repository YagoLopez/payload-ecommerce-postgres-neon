import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'
import { ProductItem } from '@/components/ProductItem'
import { OrderStatus } from '@/components/OrderStatus'
import { AddressItem } from '@/components/addresses/AddressItem'
import { UsersRepository } from '@/repositories/UsersRepository'
import { OrdersRepository } from '@/repositories/OrdersRepository'
import { redirectIfUserNotLoggedIn } from '@/utilities/redirectIfUserNotLoggedIn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const { id: orderId } = await params
  const user = await UsersRepository.getCurrentUser()
  const { email = '' } = await searchParams
  let order: Order | null = null
  redirectIfUserNotLoggedIn(user)

  try {
    const orderResult = await OrdersRepository.getOrderById(user, orderId)

    const canAccessAsGuest =
      !user &&
      email &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  return (
    <div>
      <div className="flex gap-8 justify-between items-center mb-6">
        {user ? (
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/orders">
                <ChevronLeftIcon />
                All orders
              </Link>
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase font-mono px-2 bg-primary/10 rounded tracking-[0.07em]">
          <span>{`Order #${order.id}`}</span>
        </h1>
      </div>

      <div className="grid gap-4 p-4 rounded-lg shadow-lg border">
        <Card className="bg-primary/10">
          <CardHeader>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <CardDescription className="font-mono uppercase">Order Date</CardDescription>
                <p className="text-base">
                  <time dateTime={order.createdAt}>
                    {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
                  </time>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <CardDescription className="font-mono uppercase">Total</CardDescription>
                {order.amount && <Price className="text-base" amount={order.amount} />}
              </div>
              {order.status && (
                <div className="flex flex-col gap-2">
                  <CardDescription className="font-mono uppercase">Status</CardDescription>
                  <OrderStatus className="text-base" status={order.status} />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {order.items && (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono uppercase tracking-wider">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y">
                {order.items?.map((item, index) => {
                  if (!item.product || typeof item.product !== 'object') {
                    return (
                      <li key={index} className="py-4 text-sm text-muted-foreground">
                        This item is no longer available.
                      </li>
                    )
                  }

                  const variant =
                    item.variant && typeof item.variant === 'object' ? item.variant : undefined

                  return (
                    <li key={item.id} className="py-6">
                      <ProductItem
                        product={item.product}
                        quantity={item.quantity}
                        variant={variant}
                      />
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {order.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono uppercase tracking-wider">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* @ts-expect-error - some kind of type hell */}
              <AddressItem address={order.shippingAddress} hideActions />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
