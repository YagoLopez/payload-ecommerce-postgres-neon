import type { Metadata } from 'next'
import Link from 'next/link'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { AddressesRepository } from '@/repositories/AddressesRepository'
import { Fragment } from 'react'
import { UsersRepository } from '@/repositories/UsersRepository'

export default async function Checkout() {
const user = await UsersRepository.getCurrentUser()

  if (!user?.id) {
    return (
      <div className="container min-h-[90vh] flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must be logged in to access checkout.</p>
          <Link href="/login" className="underline">
            Login here
          </Link>
        </div>
      </div>
    )
  }

  const addressesResponse = await AddressesRepository.getByCustomer({ customerId: user.id })
  const initialAddress = addressesResponse?.docs?.[0]

  return (
    <div className="container min-h-[90vh] flex">
      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div>
          <Fragment>
            {'To enable checkout, you must '}
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              rel="noopener noreferrer"
              target="_blank"
            >
              obtain your Stripe API Keys
            </a>
            {' then set them as environment variables. See the '}
            <a
              href="https://github.com/payloadcms/payload/blob/main/templates/ecommerce/README.md#stripe"
              rel="noopener noreferrer"
              target="_blank"
            >
              README
            </a>
            {' for more details.'}
          </Fragment>
        </div>
      )}

      <h1 className="sr-only">Checkout</h1>

      <CheckoutPage initialAddress={initialAddress} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
