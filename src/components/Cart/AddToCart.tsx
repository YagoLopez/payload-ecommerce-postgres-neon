'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ShoppingCart } from 'lucide-react'
import { useCartUI } from './CartUIContext'

type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { addItem, cart } = useCart()
  const { setIsCartOpen, isLoading, setIsLoading } = useCartUI()
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

  const addToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      setIsLoading(true)
      try {
        await addItem({
          product: product.id,
          variant: selectedVariant?.id ?? undefined,
        })
        toast.success('Item added to cart', {
          action: {
            label: 'Open Cart',
            onClick: () => {
              toast.dismiss()
              setIsCartOpen(true)
            },
          },
          cancel: {
            label: 'Close',
            onClick: () => toast.dismiss()
          },
          closeButton: false,
          actionButtonStyle: {
            backgroundColor: 'green',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            marginLeft: 0,
          },
          cancelButtonStyle: {
            backgroundColor: 'green',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
          },
        })
      } finally {
        setIsLoading(false)
      }
    },
    [addItem, product, selectedVariant, setIsCartOpen],
  )

  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants) {
        return existingQuantity > (selectedVariant?.inventory || 0)
      }
      return existingQuantity > (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, cart?.items, product])

  return (
    <Button
      aria-label="Add to cart"
      variant={'default'}
      className={clsx({
        'hover:opacity-90': true,
      })}
      disabled={disabled || isLoading}
      onClick={addToCart}
      type="submit"
    >
      {isLoading ? <LoadingSpinner size="small" className="text-white" /> : <ShoppingCart /> } Add To Cart
    </Button>
  )
}
