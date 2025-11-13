'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant

    // Filter variants that have valid price data
    const variantsWithPrices = product.variants?.docs
      ?.filter((variant) => {
        if (!variant || typeof variant !== 'object') return false
        
        // Check if the price field exists and is a valid number
        if (priceField in variant && typeof variant[priceField] === 'number' && variant[priceField] > 0) {
          return true
        }
        
        // Fallback to USD price field if the dynamic currency field doesn't exist
        return currency.code !== 'USD' && typeof variant.priceInUSD === 'number' && variant.priceInUSD > 0;
        

      }) as Variant[] || []

    if (variantsWithPrices.length > 0) {
      // Sort variants by price
      const variantsOrderedByPrice = variantsWithPrices
        .sort((a, b) => {
          const priceA = priceField in a ? a[priceField] : a.priceInUSD
          const priceB = priceField in b ? b[priceField] : b.priceInUSD
          
          if (typeof priceA === 'number' && typeof priceB === 'number') {
            return priceA - priceB
          }
          
          return 0
        }) as Variant[]

      const lowestVariant = variantsOrderedByPrice[0]
      const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1]
      
      const lowestPrice = priceField in lowestVariant ? lowestVariant[priceField] : lowestVariant.priceInUSD
      const highestPrice = priceField in highestVariant ? highestVariant[priceField] : highestVariant.priceInUSD

      if (
        typeof lowestPrice === 'number' &&
        typeof highestPrice === 'number' &&
        lowestPrice > 0 &&
        highestPrice > 0
      ) {
        lowestAmount = lowestPrice
        highestAmount = highestPrice
      }
    }
  } else if (product[priceField] && typeof product[priceField] === 'number' && product[priceField] > 0) {
    amount = product[priceField]
  } else if (currency.code !== 'USD' && product.priceInUSD && product.priceInUSD > 0) {
    // Fallback to USD price for non-USD currencies if available
    amount = product.priceInUSD
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {product.title}
        </h1>
        <div className="text-3xl font-bold font-mono">
          {hasVariants ? (
            <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
          ) : (
            <Price amount={amount} />
          )}
        </div>
      </div>

      {product.description ? (
        <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
          <RichText className="" data={product.description} enableGutter={false} />
        </div>
      ) : null}

      <hr className="border-border/50" />

      {hasVariants && (
        <>
          <div className="space-y-4">
            <Suspense fallback="Loading...">
              <VariantSelector product={product} />
            </Suspense>
          </div>
          <hr className="border-border/50" />
        </>
      )}

      <div className="flex items-center justify-between py-2">
        <Suspense fallback="Loading...">
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="bg-primary-foreground/95 backdrop-blur-sm py-4 -mx-8 px-8 border-t border-border/50">
        <Suspense fallback="Loading...">
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
