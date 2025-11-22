'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { Loader2, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const val = e.target as HTMLFormElement
    const search = val.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    if (search.value) {
      newParams.set('q', search.value)
    } else {
      newParams.delete('q')
    }

    router.push(createUrl('/shop', newParams))
  }

  function clearSearch(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setIsLoading(true)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('q')
    router.push(createUrl('/shop', newParams))
  }

  const searchValue = searchParams?.get('q')
  const hasSearchValue = searchValue && searchValue.length > 0

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <input
        autoComplete="off"
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-400",
          isLoading && "pr-10"
        )}
        defaultValue={searchParams?.get('q') || ''}
        key={searchParams?.get('q')}
        name="search"
        placeholder="Search for products..."
        type="text"
        disabled={isLoading}
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        ) : hasSearchValue ? (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Clear search"
            disabled={isLoading}
          >
            <X className="h-4" />
          </button>
        ) : null}
      </div>
    </form>
  )
}
