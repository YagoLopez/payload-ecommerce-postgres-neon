import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { ProductsRepository } from '@/repositories/ProductsRepository'
import React, { Suspense } from 'react'
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton'

export const metadata: { description: string; title: string } = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams

  return (
    <div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid 
          searchValue={searchValue}
          sort={sort}
          category={category}
        />
      </Suspense>
    </div>
  )
}

// Separate component for search results - loads immediately
function SearchResultsText({ totalProducts }: {
  searchValue?: string
  totalProducts?: number
}) {
  // Since searchParams are available immediately, we can show this fast
  if (totalProducts) {
    return (
      <p className="mb-4">
        Browsing <span className="font-bold capitalize">{totalProducts}</span> products
      </p>
    )
  }

  return null
}

// Separate async component for product fetching
async function ProductGrid({ 
  searchValue, 
  sort, 
  category 
}: {
  searchValue?: string
  sort?: string
  category?: string
}) {
  const products = await ProductsRepository.getAll({
    searchValue,
    sort,
    category,
  })

  const totalProducts = products.docs.length

  const resultsText = totalProducts > 1 ? 'results' : 'result'

  return (
    <>
      <SearchResultsText searchValue={searchValue} totalProducts={totalProducts} />

      {searchValue ? (
        <p className="mb-4">
          {products.docs?.length === 0
            ? 'There are no products that match '
            : `Showing ${products.docs.length} ${resultsText} for `}
          <span className="font-bold">{`"${searchValue}"`}</span>
        </p>
      ) : null}

      {!searchValue && products.docs?.length === 0 && (
        <p className="mb-4">No products found. Please try different filters.</p>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </>
  )
}
