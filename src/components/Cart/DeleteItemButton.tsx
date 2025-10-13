'use client'

import type { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { XIcon } from 'lucide-react'
import React, { useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { removeItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const itemId = item.id

  return (
    <form>
      <button
        aria-disabled={!itemId}
        aria-label="Remove cart item"
        className={clsx(
          'ease hover:cursor-pointer hover:bg-red-900 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200',
          {
            'cursor-not-allowed px-0': !itemId,
          },
        )}
        disabled={!itemId}
        onClick={async (e: React.FormEvent<HTMLButtonElement>) => {
          e.preventDefault()
          if (itemId) {
            setIsLoading(true)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            await removeItem(itemId)
            setIsLoading(false)
          }
        }}
        type="button"
      >
        {isLoading ? (<LoadingSpinner size="small" className="bg-white rounded-full" />) : (<XIcon className="hover:text-accent-3 mx-[1px] h-4 w-4 text-white dark:text-black" />)}
      </button>
    </form>
  )
}
