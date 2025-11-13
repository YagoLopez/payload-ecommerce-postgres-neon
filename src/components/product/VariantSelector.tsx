'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/payload-types'

import { createUrl } from '@/utilities/createUrl'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState<number | null>(null)
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariants = Boolean(product.enableVariants && variants?.length && variantTypes?.length)

  if (!hasVariants) {
    return null
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
        <dt className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{type.label}</dt>
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

                  isAvailableForSale = !!(matchingVariant.inventory && matchingVariant.inventory > 0);
                }
              }

              const optionUrl = createUrl(pathname, optionSearchParams)

              // The option is active if it's in the url params.
              const isActive =
                Boolean(isAvailableForSale) &&
                searchParams.get(optionKeyLowerCase) === String(optionID)

              return (
                <Button
                  variant={'outline'}
                  aria-disabled={!isAvailableForSale}
                  className={clsx(
                    'px-6 py-3 rounded-xl font-medium duration-300',
                    'hover:shadow-md hover:-translate-y-0.5',
                    {
                      'bg-accent text-accent-foreground ring-2 ring-accent shadow-lg': isActive,
                      'opacity-50 cursor-not-allowed': !isAvailableForSale,
                    }
                  )}
                  disabled={!isAvailableForSale}
                  key={option.id}
                  onClick={() => {
                    setLoading(option.id)
                    router.replace(`${optionUrl}`, {
                      scroll: false,
                    })
                    setTimeout(() => setLoading(null), 500)
                  }}
                  title={`${option.label} ${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                >
                  {loading === option.id ? (
                      <Loader2 className="mx-6 h-4 w-4 animate-spin" />
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
