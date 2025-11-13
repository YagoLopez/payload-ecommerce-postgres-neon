'use client'
import { Product, Variant } from '@/payload-types'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Price } from '@/components/Price'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')
      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0
      }
    }
    return product.inventory || 0
  }, [product.enableVariants, selectedVariant, product.inventory])

  const variantPrice = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant && selectedVariant.priceInUSD) {
        return selectedVariant.priceInUSD
      }
    }
    return undefined
  }, [product.enableVariants, selectedVariant])

  if (product.enableVariants && !selectedVariant) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 rounded-full bg-muted/50 border border-border">
      <div
        className={`h-2 w-2 rounded-full ${
          stockQuantity > 10
            ? 'bg-green-500'
            : stockQuantity > 0
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-red-500'
        }`}
      />
      <span className="text-sm font-medium">
        {stockQuantity > 10 && 'In Stock'}
        {stockQuantity <= 10 && stockQuantity > 0 && `Only ${stockQuantity} left`}
        {(stockQuantity === 0 || !stockQuantity) && 'Out of Stock'}
      </span>
      {variantPrice && (
        <>
          <Price
            amount={variantPrice}
            className="text-sm font-medium ml-auto"
            as="span"
          />
        <span className="text-sm">per unit</span>
        </>
      )}
    </div>
  )
}
