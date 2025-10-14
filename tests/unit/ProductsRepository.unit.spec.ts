import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { ProductsRepository } from '@/repositories/ProductsRepository'
import type { Product } from '@/payload-types'

// Mock dependencies
vi.mock('@payload-config', () => ({
  default: {}
}))

vi.mock('payload', () => ({
  getPayload: vi.fn()
}))

vi.mock('next/headers', () => ({
  draftMode: vi.fn()
}))

// Import mocked modules
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'

const mockGetPayload = getPayload as Mock
const mockDraftMode = draftMode as Mock

describe('ProductsRepository', () => {
  let mockPayload: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockPayload = {
      find: vi.fn()
    }
    
    mockGetPayload.mockResolvedValue(mockPayload)
    mockDraftMode.mockResolvedValue({ isEnabled: false })
  })

  describe('getBySlug', () => {
    const mockProduct: Partial<Product> = {
      id: 1,
      title: 'Test Product',
      slug: 'test-product',
      priceInUSD: 29.99,
      _status: 'published'
    }

    it('should return a product when found', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockProduct]
      })

      const result = await ProductsRepository.getBySlug({ slug: 'test-product' })

      expect(result).toEqual(mockProduct)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        depth: 3,
        draft: false,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            {
              slug: {
                equals: 'test-product',
              },
            },
            { _status: { equals: 'published' } }
          ],
        },
        populate: {
          variants: {
            title: true,
            priceInUSD: true,
            inventory: true,
            options: true,
          },
        },
      })
    })

    it('should return null when product not found', async () => {
      mockPayload.find.mockResolvedValue({
        docs: []
      })

      const result = await ProductsRepository.getBySlug({ slug: 'non-existent' })

      expect(result).toBeNull()
    })

    it('should handle draft mode enabled', async () => {
      mockDraftMode.mockResolvedValue({ isEnabled: true })
      mockPayload.find.mockResolvedValue({
        docs: [mockProduct]
      })

      const result = await ProductsRepository.getBySlug({ slug: 'test-product' })

      expect(result).toEqual(mockProduct)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        depth: 3,
        draft: true,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            {
              slug: {
                equals: 'test-product',
              },
            }
          ],
        },
        populate: {
          variants: {
            title: true,
            priceInUSD: true,
            inventory: true,
            options: true,
          },
        },
      })
    })

    it('should return null when docs array is undefined', async () => {
      mockPayload.find.mockResolvedValue({
        docs: undefined
      })

      const result = await ProductsRepository.getBySlug({ slug: 'test-product' })

      expect(result).toBeNull()
    })
  })

  describe('getAll', () => {
    const mockProducts = [
      { id: 1, title: 'Product 1', slug: 'product-1' },
      { id: 2, title: 'Product 2', slug: 'product-2' }
    ]

    it('should return all products with default parameters', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      const result = await ProductsRepository.getAll()

      expect(result).toEqual({ docs: mockProducts })
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: 'title'
      })
    })

    it('should apply custom sort parameter', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      await ProductsRepository.getAll({ sort: 'priceInUSD' })

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: 'priceInUSD'
      })
    })

    it('should apply search filter', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      await ProductsRepository.getAll({ searchValue: 'test' })

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: 'title',
        where: {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  title: {
                    like: 'test',
                  },
                },
                {
                  description: {
                    like: 'test',
                  },
                },
              ],
            }
          ],
        },
      })
    })

    it('should apply category filter', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      await ProductsRepository.getAll({ category: 'electronics' })

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: 'title',
        where: {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            {
              categories: {
                contains: 'electronics',
              },
            }
          ],
        },
      })
    })

    it('should apply both search and category filters', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      await ProductsRepository.getAll({ 
        searchValue: 'laptop',
        category: 'electronics',
        sort: 'priceInUSD'
      })

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: 'priceInUSD',
        where: {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  title: {
                    like: 'laptop',
                  },
                },
                {
                  description: {
                    like: 'laptop',
                  },
                },
              ],
            },
            {
              categories: {
                contains: 'electronics',
              },
            }
          ],
        },
      })
    })

    it('should handle array parameters', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      await ProductsRepository.getAll({ 
        searchValue: ['laptop', 'computer'],
        category: ['electronics', 'tech'],
        sort: ['priceInUSD', 'title']
      })

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: ['priceInUSD', 'title'],
        where: {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  title: {
                    like: ['laptop', 'computer'],
                  },
                },
                {
                  description: {
                    like: ['laptop', 'computer'],
                  },
                },
              ],
            },
            {
              categories: {
                contains: ['electronics', 'tech'],
              },
            }
          ],
        },
      })
    })

    it('should handle empty options object', async () => {
      mockPayload.find.mockResolvedValue({
        docs: mockProducts
      })

      await ProductsRepository.getAll({})

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true,
        },
        sort: 'title'
      })
    })
  })
})