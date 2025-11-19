import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import React, { cache } from 'react'

import { notFound } from 'next/navigation'
import { PagesRepository } from '@/repositories/PagesRepository'

const getPageBySlugCached = cache(async (slug: string) =>
  await PagesRepository.getPageBySlug(slug)
)

export async function generateStaticParams() {
  const pages = await PagesRepository.getAll()

  return pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params
  const page = await getPageBySlugCached(slug)

  return generateMeta({ doc: page })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params

  const page = await getPageBySlugCached(slug)

  // Remove this code once your website is seeded
  // if (!page && slug === 'home') {
  //   page = homeStaticData() as Page
  // }

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  return (
    <article className="pt-2 pb-24">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

