'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { Loader2, Search as SearchIcon, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect, useRef, useCallback } from 'react'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>(null)
  const isNavigatingRef = useRef(false)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Reset loading when URL changes (navigation completed)
  useEffect(() => {
    if (isNavigatingRef.current) {
      setIsLoading(false)
      isNavigatingRef.current = false
    }
  }, [searchParams])

  // Listen to Next.js navigation events
  useEffect(() => {
    // Subscribe to navigation events if available
    if (typeof window !== 'undefined') {
      const originalPush = router.push
      router.push = ((...args: Parameters<typeof originalPush>) => {
        setIsLoading(true)
        isNavigatingRef.current = true
        
        // Set timeout as fallback (5 seconds)
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false)
          isNavigatingRef.current = false
        }, 5000)

        return originalPush.apply(router, args)
      }) as typeof router.push
    }

    return () => {
      if (typeof window !== 'undefined' && loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [router])

  const resetLoading = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    setIsLoading(false)
    isNavigatingRef.current = false
  }, [])

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

    resetLoading()
    router.push(createUrl('/shop', newParams))
  }

  function clearSearch(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('q')

    resetLoading()
    router.push(createUrl('/shop', newParams))
  }

  const searchValue = searchParams?.get('q')
  const hasSearchValue = searchValue && searchValue.length > 0

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <input
        autoComplete="off"
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-400",
          isLoading && "opacity-70"
        )}
        defaultValue={searchParams?.get('q') || ''}
        key={searchParams?.get('q')}
        name="search"
        placeholder="Search for products..."
        type="text"
        disabled={isLoading}
        onChange={() => {
          if (isLoading) {
            resetLoading()
          }
        }}
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
        ) : hasSearchValue ? (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-2 rounded-md shadow-md"
            aria-label="Clear search"
          >
            <X className="h-4" />
          </button>
        ) : (
          <SearchIcon className="h-4 text-neutral-500" />
        )}
      </div>
    </form>
  )
}
