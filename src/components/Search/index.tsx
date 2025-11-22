'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { useTopLoader } from 'nextjs-toploader'
import { CircleXIcon, Search as SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loader = useTopLoader()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const val = e.target as HTMLFormElement
    const search = val.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    if (search.value) {
      newParams.set('q', search.value)
    } else {
      newParams.delete('q')
    }

    // Start top loader animation
    loader.start()
    router.push(createUrl('/shop', newParams))
  }

  function clearSearch(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('q')
    loader.start()
    router.push(createUrl('/shop', newParams))
  }

  const searchValue = searchParams?.get('q')
  const hasSearchValue = searchValue && searchValue.length > 0

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <input
        autoComplete="off"
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-400"
        )}
        defaultValue={searchParams?.get('q') || ''}
        key={searchParams?.get('q')}
        name="search"
        placeholder="Search for products..."
        type="text"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        {hasSearchValue ? (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors rounded-md"
            aria-label="Clear search"
            title="Clear Search"
          >
            <CircleXIcon className="h-4 w-4 text-gray-500" />

          </button>
        ) : (
          <SearchIcon className="h-4 text-neutral-500" />
        )}
      </div>
    </form>
  )
}
