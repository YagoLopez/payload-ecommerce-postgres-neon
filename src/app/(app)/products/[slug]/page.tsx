import type { Media, Product } from '@/payload-types'
import { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { GridTileImage } from '@/components/Grid/tile'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'
import { ProductsRepository } from '@/repositories/ProductsRepository'

type Args = {
  params: Promise<{
    slug: string
  }>
}

const getProductBySlugCached = cache(async ({ slug }: { slug: string }) =>
  await ProductsRepository.getBySlug({ slug })
)

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlugCached({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await getProductBySlugCached({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInUSD

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInUSD && acc && variant?.priceInUSD > acc) {
        return variant.priceInUSD
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'usd',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        type="application/ld+json"
      />
      <div className="container pt-8 pb-8">
        <Button asChild variant="ghost" className="mb-6 hover:translate-x-1 transition-transform duration-300">
          <Link href="/shop">
            <ChevronLeftIcon className="mr-2" />
            All products
          </Link>
        </Button>
        <div className="flex flex-col gap-12 rounded-2xl border p-8 md:py-12 lg:flex-row lg:gap-12 bg-primary-foreground duration-500">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-xl bg-muted animate-pulse" />
              }
            >
              {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : <></>}

      {relatedProducts.length ? (
        <div className="container">
          <RelatedProducts products={relatedProducts as Product[]} />
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null

  return (
    <div className="py-12">
      <h2 className="mb-8 text-3xl font-bold tracking-tight">You May Also Like</h2>
      <ul className="flex w-full gap-6 overflow-x-auto pt-1 pb-4">
        {products.map((product) => (
          <li
            className="aspect-square w-full flex-none min-[600px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 group"
            key={product.id}
          >
            <Link className="relative h-full w-full block transition-transform duration-300 hover:-translate-y-2" href={`/products/${product.slug}`}>
              <div className="h-full w-full rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <GridTileImage
                  label={{
                    amount: product.priceInUSD!,
                    title: product.title,
                  }}
                  media={product.meta?.image as Media}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
