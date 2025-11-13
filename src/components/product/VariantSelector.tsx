'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/payload-types'

import { createUrl } from '@/utilities/createUrl'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface LoadingState {
  [optionId: string]: boolean
}

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const [isNavigating, setIsNavigating] = useState(false)
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariants = Boolean(product.enableVariants && variants?.length && variantTypes?.length)

  useEffect(() => {
    setIsNavigating(false)
    setLoadingStates({})
  }, [searchParams])

  if (!hasVariants) {
    return null
  }

  const handleVariantChange = async (optionId: number, optionUrl: string) => {
    setLoadingStates(prev => ({ ...prev, [optionId]: true }))
    setIsNavigating(true)

    try {
      router.replace(optionUrl, {
        scroll: false,
      })
    } catch (error) {
      console.error('Navigation error:', error)
      setLoadingStates(prev => ({ ...prev, [optionId]: false }))
      setIsNavigating(false)
    }
  }

  return variantTypes?.map((type) => {
    if (!type || typeof type !== 'object') {
      return null
    }

    const options = type.options?.docs

    if (!options || !Array.isArray(options) || !options.length) {
      return null
    }

    return (
      <dl className="space-y-4" key={type.id}>
        <dt className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {type.label}
        </dt>
        <dd className="flex flex-wrap gap-3">
          <>
            {options?.map((option) => {
              if (!option || typeof option !== 'object') {
                return null
              }

              const optionID = option.id
              const optionKeyLowerCase = type.name

              // Base option params on current params so we can preserve any other param state in the url.
              const optionSearchParams = new URLSearchParams(searchParams.toString())

              // Remove image and variant ID from this search params so we can loop over it safely.
              optionSearchParams.delete('variant')
              optionSearchParams.delete('image')

              // Update the option params using the current option to reflect how the url *would* change,
              // if the option was clicked.
              optionSearchParams.set(optionKeyLowerCase, String(optionID))

              const currentOptions = Array.from(optionSearchParams.values())

              let isAvailableForSale = true

              // Find a matching variant
              if (variants) {
                const matchingVariant = variants
                  .filter((variant) => typeof variant === 'object')
                  .find((variant) => {
                    if (!variant.options || !Array.isArray(variant.options)) return false

                    // Check if all variant options match the current options in the URL
                    return variant.options.every((variantOption) => {
                      if (typeof variantOption !== 'object')
                        return currentOptions.includes(String(variantOption))

                      return currentOptions.includes(String(variantOption.id))
                    })
                  })

                if (matchingVariant) {
                  // If we found a matching variant, set the variant ID in the search params.
                  optionSearchParams.set('variant', String(matchingVariant.id))

                  isAvailableForSale = !!(matchingVariant.inventory && matchingVariant.inventory > 0)
                }
              }

              const optionUrl = createUrl(pathname, optionSearchParams)

              // The option is active if it's in the url params.
              const isActive =
                Boolean(isAvailableForSale) &&
                searchParams.get(optionKeyLowerCase) === String(optionID)

              const isLoading = loadingStates[option.id] || false

              return (
                <Button
                  variant={'outline'}
                  aria-disabled={!isAvailableForSale}
                  aria-busy={isLoading}
                  className={clsx(
                    'px-6 py-3 rounded-xl font-medium duration-300',
                    'hover:shadow-md hover:-translate-y-0.5',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    {
                      'bg-primary text-primary-foreground ring-1 ring-primary ring-offset-1 shadow-lg font-bold hover:bg-primary/90': isActive,
                      'opacity-50 cursor-not-allowed': !isAvailableForSale,
                      'opacity-75': isLoading,
                    }
                  )}
                  disabled={!isAvailableForSale || isLoading}
                  key={option.id}
                  onClick={() => {
                    if (isLoading || !isAvailableForSale || isNavigating) return
                    handleVariantChange(option.id, optionUrl).then()
                  }}
                  title={`${option.label} ${!isAvailableForSale ? ' (Out of Stock)' : ''}${isLoading ? ' Loading' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="mx-4 h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    option.label
                  )}
                </Button>
              )
            })}
          </>
        </dd>
      </dl>
    )
  })
}
