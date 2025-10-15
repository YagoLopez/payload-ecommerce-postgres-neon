import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInUSD, title } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD
    ) {
      price = variant.priceInUSD
    }
  }

  const image =
    gallery?.[0]?.image && true ? gallery[0]?.image : false

  return (
    <Link 
      className="relative inline-block h-full w-full group shadow-md hover:shadow-xl hover:shadow-black/20 transition-all duration-500 ease-out ring-1 ring-border group-hover:ring-accent/50 bg-primary-foreground rounded-lg transform hover:-translate-y-1 hover:scale-[1.02]"
      href={`/products/${product.slug}`}
    >
      <div className="relative transition-all duration-300 ease-out">
        {image ? (
          <Media
            className={clsx(
              'relative aspect-square object-cover rounded-2xl p-8'
            )}
            height={80}
            imgClassName={clsx(
              'h-full w-full object-cover rounded-2xl',
              'transition-transform duration-500 ease-out group-hover:scale-105'
            )}
            resource={image}
            width={80}
          />
        ) : null}

        <div className="font-mono text-primary/50 group-hover:text-primary flex justify-between items-center border-t bg-gray-100">
          <div className="font-medium group-hover:translate-x-1 transition-transform duration-300 p-4">
            {title}
          </div>

          {typeof price === 'number' && (
            <div className="font-semibold text-primary/60 group-hover:bg-gray-100 px-2 rounded-md transition-colors duration-300">
              <Price amount={price} />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
