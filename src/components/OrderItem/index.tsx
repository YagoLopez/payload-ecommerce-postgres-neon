import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'

type Props = {
  order: Order
}

export const OrderItem: React.FC<Props> = ({ order }) => {
  const itemsLabel = order.items?.length === 1 ? 'Item' : 'Items'

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center gap-4">
          <Link href={`/orders/${order.id}`} className="max-w-[calc(100%-100px)]">
            <h3 className="text-sm uppercase font-mono tracking-[0.07em] hover:underline px-2 bg-primary/10 rounded inline-block truncate w-full">
              {`Order #${order.id}`}
            </h3>
          </Link>
          <Button variant="outline" asChild size="sm">
            <Link href={`/orders/${order.id}`}>View Order</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <CardDescription className="font-mono uppercase">Date</CardDescription>
            <p className="text-base">
              <time dateTime={order.createdAt}>
                {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
              </time>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <CardDescription className="font-mono uppercase">Total</CardDescription>
            <div className="flex items-center gap-2 text-base">
              {order.amount && (
                <Price amount={order.amount} currencyCode={order.currency ?? undefined} />
              )}
              <span className="text-muted-foreground text-sm">
                ({order.items?.length} {itemsLabel})
              </span>
            </div>
          </div>
          {order.status && (
            <div className="flex flex-col gap-2">
              <CardDescription className="font-mono uppercase">Status</CardDescription>
              <OrderStatus className="text-base" status={order.status} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
