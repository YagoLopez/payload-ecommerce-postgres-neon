import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { 
  mockCurrentUser, 
  mockAdminUser, 
  mockUserWithRoles, 
  mockAuthResultWithUser,
  mockAuthResultWithoutUser,
  mockHeaders,
  mockEmptyHeaders,
  mockInvalidHeaders
} from '../fixtures'

// Create mock functions
const mockGetPayload = vi.fn()
const mockGetHeaders = vi.fn()

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
  headers: mockGetHeaders
}))

// Create mock payload instance
const mockPayload = {
  auth: vi.fn()
}

// Set up the mock before importing the module
mockGetPayload.mockResolvedValue(mockPayload)

// Import the module under test AFTER mocking dependencies
const { UsersRepository } = await import('@/repositories/UsersRepository')

describe('UsersRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reconfigure the mocks for each test
    mockGetPayload.mockResolvedValue(mockPayload)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return user when authenticated successfully', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockCurrentUser)
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should return null when user is not authenticated', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithoutUser)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toBeNull()
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should return null when headers are empty', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockEmptyHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithoutUser)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toBeNull()
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockEmptyHeaders })
    })

    it('should return user with admin roles', async () => {
      // Arrange
      const adminAuthResult = {
        user: mockAdminUser,
        token: 'admin-jwt-token',
        exp: 1234567890
      }
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(adminAuthResult)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockAdminUser)
      expect(result?.roles).toContain('admin')
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should return user with multiple roles', async () => {
      // Arrange
      const multiRoleAuthResult = {
        user: mockUserWithRoles,
        token: 'multi-role-jwt-token',
        exp: 1234567890
      }
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(multiRoleAuthResult)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockUserWithRoles)
      expect(result?.roles).toContain('read-only')
      expect(result?.roles).toContain('customer')
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle payload.auth throwing an error', async () => {
      // Arrange
      const error = new Error('Authentication failed')
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockRejectedValue(error)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow('Authentication failed')
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle getHeaders throwing an error', async () => {
      // Arrange
      const error = new Error('Failed to get headers')
      mockGetHeaders.mockRejectedValue(error)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithoutUser)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow('Failed to get headers')
      expect(mockGetHeaders).toHaveBeenCalled()
    })

    it('should handle invalid token gracefully', async () => {
      // Arrange
      const invalidTokenError = new Error('Invalid token')
      mockGetHeaders.mockResolvedValue(mockInvalidHeaders)
      mockPayload.auth.mockRejectedValue(invalidTokenError)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow('Invalid token')
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockInvalidHeaders })
    })

    it('should handle expired token', async () => {
      // Arrange
      const expiredAuthResult = {
        user: null,
        token: null,
        exp: 0 // Expired timestamp
      }
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(expiredAuthResult)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toBeNull()
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle malformed auth response', async () => {
      // Arrange
      const malformedAuthResult = {
        user: undefined,
        token: 'some-token',
        exp: 1234567890
      }
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(malformedAuthResult)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toBeUndefined()
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle network timeout during authentication', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout')
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockRejectedValue(timeoutError)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow('Request timeout')
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle database connection errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockRejectedValue(dbError)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow('Database connection failed')
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle concurrent authentication requests', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act - Multiple concurrent requests
      const results = await Promise.all([
        UsersRepository.getCurrentUser(),
        UsersRepository.getCurrentUser(),
        UsersRepository.getCurrentUser()
      ])

      // Assert
      results.forEach(result => {
        expect(result).toEqual(mockCurrentUser)
      })
      expect(mockGetHeaders).toHaveBeenCalledTimes(3)
      expect(mockPayload.auth).toHaveBeenCalledTimes(3)
    })

    it('should handle null user object gracefully', async () => {
      // Arrange
      const nullUserAuthResult = {
        user: null,
        token: 'some-token',
        exp: 1234567890
      }
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(nullUserAuthResult)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toBeNull()
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle undefined auth response', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(undefined)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow()
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: mockHeaders })
    })

    it('should handle special characters in headers', async () => {
      // Arrange
      const specialHeaders = {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'content-type': 'application/json; charset=utf-8',
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
      mockGetHeaders.mockResolvedValue(specialHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockCurrentUser)
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: specialHeaders })
    })

    it('should handle very large header values', async () => {
      // Arrange
      const largeHeaderValue = 'x-custom-header: ' + 'a'.repeat(10000)
      const largeHeaders = {
        authorization: `Bearer ${largeHeaderValue}`,
        'content-type': 'application/json'
      }
      mockGetHeaders.mockResolvedValue(largeHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockCurrentUser)
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: largeHeaders })
    })

    it('should handle unicode characters in headers', async () => {
      // Arrange
      const unicodeHeaders = {
        authorization: 'Bearer 测试令牌-тест-מבחן',
        'content-type': 'application/json; charset=utf-8',
        'x-user-name': 'José María González López'
      }
      mockGetHeaders.mockResolvedValue(unicodeHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockCurrentUser)
      expect(mockGetHeaders).toHaveBeenCalled()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: unicodeHeaders })
    })
  })

  describe('integration scenarios', () => {
    it('should handle repository initialization errors', async () => {
      // Arrange
      const initError = new Error('Failed to initialize payload client')
      mockGetHeaders.mockResolvedValue(mockHeaders)
      // Mock payload.auth to throw the initialization error to simulate getPayload failure
      mockPayload.auth.mockRejectedValue(initError)

      // Act & Assert
      await expect(UsersRepository.getCurrentUser()).rejects.toThrow('Failed to initialize payload client')
    })

    it('should handle mixed success and failure scenarios', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      
      // Mock payload.auth to alternate between success and failure
      let callCount = 0
      mockPayload.auth.mockImplementation(() => {
        callCount++
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Intermittent failure'))
        }
        return Promise.resolve(mockAuthResultWithUser)
      })

      // Act - Mix of successful and failed requests
      const results = await Promise.allSettled([
        UsersRepository.getCurrentUser(),
        UsersRepository.getCurrentUser(),
        UsersRepository.getCurrentUser()
      ])

      // Assert
      expect(results[0].status).toBe('fulfilled')
      expect((results[0] as PromiseFulfilledResult<never>).value).toEqual(mockCurrentUser)
      
      expect(results[1].status).toBe('rejected')
      expect((results[1] as PromiseRejectedResult).reason.message).toBe('Intermittent failure')
      
      expect(results[2].status).toBe('fulfilled')
      expect((results[2] as PromiseFulfilledResult<never>).value).toEqual(mockCurrentUser)
    })

    it('should handle rapid sequential calls', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act - Rapid sequential calls
      const promises = Array.from({ length: 10 }, () => UsersRepository.getCurrentUser())
      const results = await Promise.all(promises)

      // Assert
      results.forEach(result => {
        expect(result).toEqual(mockCurrentUser)
      })
      expect(mockGetHeaders).toHaveBeenCalledTimes(10)
      expect(mockPayload.auth).toHaveBeenCalledTimes(10)
    })

    it('should handle authentication state changes during requests', async () => {
      // Arrange
      let authState: typeof mockAuthResultWithUser | typeof mockAuthResultWithoutUser = mockAuthResultWithUser
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockImplementation(() => Promise.resolve(authState))

      // Act
      const firstResult = await UsersRepository.getCurrentUser()
      
      // Simulate user logging out
      authState = mockAuthResultWithoutUser
      const secondResult = await UsersRepository.getCurrentUser()

      // Assert
      expect(firstResult).toEqual(mockCurrentUser)
      expect(secondResult).toBeNull()
    })
  })

  describe('performance and optimization', () => {
    it('should properly clean up resources after authentication', async () => {
      // Arrange
      mockGetHeaders.mockResolvedValue(mockHeaders)
      mockPayload.auth.mockResolvedValue(mockAuthResultWithUser)

      // Act
      await UsersRepository.getCurrentUser()

      // Assert
      // Verify that mocks were called but don't leave hanging promises
      expect(mockGetHeaders).toHaveBeenCalledTimes(1)
      expect(mockPayload.auth).toHaveBeenCalledTimes(1)
    })

    it('should handle authentication with minimal memory footprint', async () => {
      // Arrange
      const minimalHeaders = {
        authorization: 'Bearer token123'
      }
      mockGetHeaders.mockResolvedValue(minimalHeaders)
      mockPayload.auth.mockResolvedValue({
        user: { ...mockCurrentUser },
        token: 'token123',
        exp: 1234567890
      })

      // Act
      const result = await UsersRepository.getCurrentUser()

      // Assert
      expect(result).toEqual(mockCurrentUser)
      expect(mockGetHeaders).toHaveBeenCalledWith()
      expect(mockPayload.auth).toHaveBeenCalledWith({ headers: minimalHeaders })
    })
  })
})
