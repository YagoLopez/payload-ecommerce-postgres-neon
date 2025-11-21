import React from 'react'
import { Grid } from '@/components/Grid'

export function ProductGridSkeleton() {
  return (
    <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(12)
        .fill(0)
        .map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
    </Grid>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div id="image-placeholder" className="bg-neutral-200 dark:bg-neutral-800 aspect-square rounded-2xl mb-4" />
      <div id="title-placeholder" className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
      <div id="price-placeholder" className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
    </div>
  )
}
