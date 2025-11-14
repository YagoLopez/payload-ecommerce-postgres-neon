import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { 
  mockPage, 
  mockPayloadFindResultPages,
  mockEmptyPayloadFindResultPages,
  mockMultiplePagesResult
} from '../fixtures'
import { Page } from '@/payload-types'

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
const { PagesRepository } = await import('@/repositories/PagesRepository')

describe('PagesRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reconfigure the mock for each test
    mockGetPayload.mockResolvedValue(mockPayload)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getPageBySlug', () => {
    it('should return a page when found in published mode', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toEqual(mockPage)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: false,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: 'published' } }
          ]
        }
      })
    })

    it('should return a page when found in draft mode', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: true })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toEqual(mockPage)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: true,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } }
          ]
        }
      })
    })

    it('should return null when page is not found', async () => {
      // Arrange
      const slug = 'non-existent-page'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle empty docs array', async () => {
      // Arrange
      const slug = 'test-page'
      const emptyResult = { ...mockEmptyPayloadFindResultPages, docs: [] }
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(emptyResult)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
    })

    it('should handle payload.find throwing an error', async () => {
      // Arrange
      const slug = 'test-page'
      const error = new Error('Database connection failed')
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockRejectedValue(error)

      // Act & Assert
      await expect(PagesRepository.getPageBySlug(slug)).rejects.toThrow('Database connection failed')
    })

    it('should handle draftMode throwing an error', async () => {
      // Arrange
      const slug = 'test-page'
      const error = new Error('Failed to check draft mode')
      mockDraftMode.mockRejectedValue(error)
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act & Assert
      await expect(PagesRepository.getPageBySlug(slug)).rejects.toThrow('Failed to check draft mode')
    })

    it('should handle undefined slug gracefully', async () => {
      // Arrange
      const slug = undefined as unknown as string
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: false,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            { slug: { equals: undefined } },
            { _status: { equals: 'published' } }
          ]
        }
      })
    })

    it('should handle empty string slug', async () => {
      // Arrange
      const slug = ''
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    it('should return all published pages with slugs only', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockMultiplePagesResult)

      // Act
      const result = await PagesRepository.getAll()

      // Assert
      expect(result).toEqual(mockMultiplePagesResult)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
        },
      })
    })

    it('should handle payload.find returning empty result', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getAll()

      // Assert
      expect(result).toEqual(mockEmptyPayloadFindResultPages)
      expect(result.docs).toEqual([])
      expect(result.totalDocs).toBe(0)
    })

    it('should handle payload.find throwing an error', async () => {
      // Arrange
      const error = new Error('Database query failed')
      mockPayload.find.mockRejectedValue(error)

      // Act & Assert
      await expect(PagesRepository.getAll()).rejects.toThrow('Database query failed')
    })

    it('should handle very large result sets', async () => {
      // Arrange
      const largeResult = {
        ...mockMultiplePagesResult,
        totalDocs: 10000,
        hasNextPage: true,
        hasPrevPage: false,
        totalPages: 1000,
        limit: 10,
        page: 1
      }
      mockPayload.find.mockResolvedValue(largeResult)

      // Act
      const result = await PagesRepository.getAll()

      // Assert
      expect(result).toEqual(largeResult)
      expect(result.totalDocs).toBe(10000)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle special characters in slug', async () => {
      // Arrange
      const slug = 'test-page-with-special-chars!@#$%'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: false,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: 'published' } }
          ]
        }
      })
    })

    it('should handle unicode characters in slug', async () => {
      // Arrange
      const slug = '测试页面-тест-صفحة'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle network timeout scenarios', async () => {
      // Arrange
      const slug = 'test-page'
      const timeoutError = new Error('Network timeout')
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockRejectedValue(timeoutError)

      // Act & Assert
      await expect(PagesRepository.getPageBySlug(slug)).rejects.toThrow('Network timeout')
    })

    it('should handle concurrent requests for the same page', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act - Multiple concurrent requests
      const results = await Promise.all([
        PagesRepository.getPageBySlug(slug),
        PagesRepository.getPageBySlug(slug),
        PagesRepository.getPageBySlug(slug)
      ])

      // Assert
      results.forEach(result => {
        expect(result).toEqual(mockPage)
      })
      expect(mockPayload.find).toHaveBeenCalledTimes(3)
    })

    it('should handle very long slugs', async () => {
      // Arrange
      const slug = 'a'.repeat(1000)
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockEmptyPayloadFindResultPages)

      // Act
      const result = await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalled()
    })
  })

  describe('performance considerations', () => {
    it('should use limit=1 for getPageBySlug to improve performance', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act
      await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      )
    })

    it('should set pagination=false for getPageBySlug to improve performance', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act
      await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: false })
      )
    })

    it('should use high limit for getAll to retrieve more pages', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockMultiplePagesResult)

      // Act
      await PagesRepository.getAll()

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1000 })
      )
    })

    it('should set pagination=false for getAll to improve performance', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockMultiplePagesResult)

      // Act
      await PagesRepository.getAll()

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: false })
      )
    })
  })

  describe('draft mode integration', () => {
    it('should enable draft mode when draftMode().isEnabled is true', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: true })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act
      await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ 
          draft: true,
          overrideAccess: true
        })
      )
    })

    it('should disable draft mode when draftMode().isEnabled is false', async () => {
      // Arrange
      const slug = 'test-page'
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)

      // Act
      await PagesRepository.getPageBySlug(slug)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ 
          draft: false,
          overrideAccess: false
        })
      )
    })

    it('should add published status filter only when not in draft mode', async () => {
      // Arrange
      const slug = 'test-page'
      
      // Test draft mode enabled - should NOT include _status filter
      mockDraftMode.mockResolvedValue({ isEnabled: true })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)
      
      await PagesRepository.getPageBySlug(slug)
      
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: true,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } }
            // No _status filter when draft mode is enabled
          ]
        }
      })

      // Reset mocks
      vi.clearAllMocks()
      mockGetPayload.mockResolvedValue(mockPayload)
      
      // Test draft mode disabled - should include _status filter
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      mockPayload.find.mockResolvedValue(mockPayloadFindResultPages)
      
      await PagesRepository.getPageBySlug(slug)
      
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'pages',
        draft: false,
        limit: 1,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: 'published' } }
          ]
        }
      })
    })
  })

  describe('integration scenarios', () => {
    it('should handle repository initialization errors', async () => {
      // Arrange - Simulate what happens when payload operations fail (more realistic)
      const initError = new Error('Failed to initialize payload client')
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      // Mock payload.find to throw the initialization error to simulate getPayload failure
      mockPayload.find.mockRejectedValue(initError)

      // Act & Assert - Repository methods should propagate the initialization error
      await expect(PagesRepository.getPageBySlug('test')).rejects.toThrow('Failed to initialize payload client')
      // Reset mock for getAll test
      mockPayload.find.mockRejectedValue(initError)
      await expect(PagesRepository.getAll()).rejects.toThrow('Failed to initialize payload client')
    })

    it('should handle concurrent mixed operations', async () => {
      // Arrange
      mockDraftMode.mockResolvedValue({ isEnabled: false })
      
      // Set up mock to differentiate between getPageBySlug and getAll calls
      mockPayload.find.mockImplementation((query) => {
        // getAll calls have select: { slug: true } and limit: 1000
        if (query.select?.slug === true && query.limit === 1000) {
          return Promise.resolve(mockMultiplePagesResult)
        }
        // getPageBySlug calls have limit: 1 and no specific select
        if (query.limit === 1 && !query.select) {
          return Promise.resolve(mockPayloadFindResultPages)
        }
        // Default fallback
        return Promise.resolve(mockEmptyPayloadFindResultPages)
      })

      // Act
      const results = await Promise.allSettled([
        PagesRepository.getPageBySlug('test-page'),
        PagesRepository.getAll(),
        PagesRepository.getPageBySlug('another-page'),
        PagesRepository.getAll()
      ])

      // Assert
      results.forEach((result, index) => {
        expect(result.status).toBe('fulfilled')
        
        if (result.status === 'fulfilled') {
          if (index % 2 === 0) {
            // getPageBySlug results (indices 0, 2)
            // Type assertion needed due to mixed return types in Promise.allSettled
            expect((result as PromiseFulfilledResult<Page | null>).value).toEqual(mockPage)
          } else {
            // getAll results (indices 1, 3)
            // Type assertion needed due to mixed return types in Promise.allSettled
            expect((result as PromiseFulfilledResult<Page[] | null>).value).toEqual(mockMultiplePagesResult)
          }
        }
      })
    })
  })
})
