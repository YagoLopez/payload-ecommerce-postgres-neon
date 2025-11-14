import type { Product } from '@/payload-types'

export const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: null,
  slug: 'test-product',
  priceInUSD: 29.99,
  priceInUSDEnabled: true,
  inventory: 100,
  enableVariants: false,
  variantTypes: null,
  variants: {
    docs: [],
    hasNextPage: false,
    totalDocs: 0
  },
  relatedProducts: null,
  meta: {
    title: 'Test Product',
    description: 'A test product',
    image: null
  },
  categories: null,
  slugLock: null,
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  _status: 'published',
  gallery: null,
  layout: null
}

export const mockPayloadFindResult = {
  docs: [mockProduct],
  totalDocs: 1,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
  page: 1,
  totalPages: 1,
  pager: {
    prev: null,
    next: null
  }
}

export const mockEmptyPayloadFindResult = {
  docs: [],
  totalDocs: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
  page: 1,
  totalPages: 0,
  pager: {
    prev: null,
    next: null
  }
}
