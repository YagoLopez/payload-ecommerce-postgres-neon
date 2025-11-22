'use client'

import { useSearchParams } from 'next/navigation'
import { CircleXIcon } from 'lucide-react'
import React, { useMemo } from 'react'
import Link from 'next/link'

export const ClearFilters: React.FC = () => {
  const searchParams = useSearchParams()

  const hasActiveFilters = useMemo(() => {
    return searchParams.has('q') || searchParams.has('sort') || searchParams.has('category')
  }, [searchParams])

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="inline-flex items-center rounded-lg p-1 w-[140px] hover:cursor-pointer border text-gray-500 bg-gray-50 hover:bg-gray-100 hover:shadow-lg hover:scale-101">
      <CircleXIcon className="h-4 w-4 transition-all duration-200 ease-in-out hover:rotate-90" />
      <Link href="/shop" className="px-2 font-light transition-colors duration-200 ease-in-out">
        Clear Filters
      </Link>
    </div>
  )
}
