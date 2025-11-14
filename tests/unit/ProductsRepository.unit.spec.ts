import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mockEmptyPayloadFindResult, mockPayloadFindResult, mockProduct } from '../fixtures'

// Create mock functions
const mockGetPayload = vi.fn()
const mockDraftMode = vi.fn()


// Mock dependencies BEFORE importing the module under test
vi.mock('@/payload-config', () => ({
  default: Promise.resolve({})
}))

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as object),
    getPayload: mockGetPayload
  }
})

vi.mock('next/headers', () => ({
  draftMode: mockDraftMode
}))

// Create mock payload instance
const mockPayload = {
  find: vi.fn()
}

// Set up the mock before importing the module
mockGetPayload.mockResolvedValue(mockPayload)

// Import the module under test AFTER mocking dependencies
const { ProductsRepository } = await import('@/repositories/ProductsRepository')

describe('ProductsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reconfigure the mock for each test
    mockGetPayload.mockResolvedValue(mockPayload)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getBySlug', () => {
    it('should return a product when found in published mode', async () => {
      // Arrange
      const slug = 'test-product'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      const result = await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(result).toEqual(mockProduct)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        depth: 3,
        draft: false,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: 'published' } }
          ]
        },
        populate: {
          variants: {
            title: true,
            priceInUSD: true,
            inventory: true,
            options: true
          }
        }
      })
    })

    it('should return a product when found in draft mode', async () => {
      // Arrange
      const slug = 'test-product'
      mockDraftMode.mockResolvedValue({ isEnabled: true })
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      const result = await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(result).toEqual(mockProduct)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        depth: 3,
        draft: true,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [{ slug: { equals: slug } }]
        },
        populate: {
          variants: {
            title: true,
            priceInUSD: true,
            inventory: true,
            options: true
          }
        }
      })
    })

    it('should return null when product is not found', async () => {
      // Arrange
      const slug = 'non-existent-product'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResult)

      // Act
      const result = await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle empty docs array', async () => {
      // Arrange
      const slug = 'test-product'
      const emptyResult = { ...mockEmptyPayloadFindResult, docs: [] }
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(emptyResult)

      // Act
      const result = await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(result).toBeNull()
    })

    it('should handle payload.find throwing an error', async () => {
      // Arrange
      const slug = 'test-product'
      const error = new Error('Database connection failed')
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockRejectedValue(error)

      // Act & Assert
      await expect(ProductsRepository.getBySlug({ slug })).rejects.toThrow('Database connection failed')
    })

    it('should handle draftMode throwing an error', async () => {
      // Arrange
      const slug = 'test-product'
      const error = new Error('Failed to check draft mode')
      mockDraftMode.mockRejectedValue(error)
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act & Assert
      await expect(ProductsRepository.getBySlug({ slug })).rejects.toThrow('Failed to check draft mode')
    })
  })

  describe('getAll', () => {
    it('should return all published products with default sorting', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      const result = await ProductsRepository.getAll()

      // Assert
      expect(result).toEqual(mockPayloadFindResult)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: true,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true
        },
        sort: 'title'
      })
    })

    it('should apply custom sorting when provided', async () => {
      // Arrange
      const sort = '-createdAt'
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      const result = await ProductsRepository.getAll({ sort })

      // Assert
      expect(result).toEqual(mockPayloadFindResult)
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          sort
        })
      )
    })

    it('should apply search filter when provided', async () => {
      // Arrange
      const searchValue = 'test'
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { _status: { equals: 'published' } },
              {
                or: [
                  { title: { like: searchValue } }
                ]
              }
            ]
          }
        })
      )
    })

    it('should apply category filter when provided', async () => {
      // Arrange
      const category = 'electronics'
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ category })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { _status: { equals: 'published' } },
              {
                categories: { contains: category }
              }
            ]
          }
        })
      )
    })

    it('should apply both search and category filters', async () => {
      // Arrange
      const searchValue = 'laptop'
      const category = 'electronics'
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue, category })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { _status: { equals: 'published' } },
              {
                or: [
                  { title: { like: searchValue } }
                ]
              },
              {
                categories: { contains: category }
              }
            ]
          }
        })
      )
    })

    it('should handle array search values', async () => {
      // Arrange
      const searchValue = ['laptop', 'computer']
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { _status: { equals: 'published' } },
              {
                or: [
                  { title: { like: searchValue } }
                ]
              }
            ]
          }
        })
      )
    })

    it('should handle array category values', async () => {
      // Arrange
      const category = ['electronics', 'computers']
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ category })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { _status: { equals: 'published' } } ,
              {
                categories: { contains: category }
              }
            ]
          }
        })
      )
    })

    it('should handle empty search and category gracefully', async () => {
      // Arrange
      const searchValue = ''
      const category = ''
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue, category })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: true,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true
        },
        sort: 'title'
      })
    })

    it('should handle null and undefined values gracefully', async () => {
      // Arrange
      const searchValue = null
      const category = undefined
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue, category })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: true,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true
        },
        sort: 'title'
      })
    })

    it('should handle payload.find throwing an error', async () => {
      // Arrange
      const error = new Error('Database query failed')
      mockPayload.find.mockRejectedValue(error)

      // Act & Assert
      await expect(ProductsRepository.getAll()).rejects.toThrow('Database query failed')
    })

    it('should handle mixed case sorting options', async () => {
      // Arrange
      const sort = 'Title'
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ sort })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'Title' })
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle special characters in search values', async () => {
      // Arrange
      const searchValue = 'test@#$%^&*()'
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue })

      // Assert
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle very long search strings', async () => {
      // Arrange
      const searchValue = 'a'.repeat(1000)
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll({ searchValue })

      // Assert
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle unicode characters in slug', async () => {
      // Arrange
      const slug = '产品测试-测试产品'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: 'published' } }
            ]
          }
        })
      )
    })

    it('should handle complex filter combinations', async () => {
      // Arrange
      const options = {
        searchValue: 'laptop gaming',
        sort: '-priceInUSD',
        category: 'electronics'
      }
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getAll(options)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'products',
        draft: false,
        overrideAccess: true,
        select: {
          title: true,
          slug: true,
          gallery: true,
          categories: true,
          priceInUSD: true
        },
        sort: '-priceInUSD',
        where: {
          and: [
            { _status: { equals: 'published' } },
            {
              or: [
                { title: { like: 'laptop gaming' } }
              ]
            },
            {
              categories: { contains: 'electronics' }
            }
          ]
        }
      })
    })
  })

  describe('performance considerations', () => {
    it('should use limit=1 for getBySlug to improve performance', async () => {
      // Arrange
      const slug = 'test-product'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      )
    })

    it('should set pagination=false for getBySlug to improve performance', async () => {
      // Arrange
      const slug = 'test-product'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResult)

      // Act
      await ProductsRepository.getBySlug({ slug })

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: false })
      )
    })
  })
})
