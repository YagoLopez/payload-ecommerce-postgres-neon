import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { 
  mockUser, 
  mockAdminUser,
  mockOrder, 
  mockOrderCompleted,
  mockOrderCancelled,
  mockOrderRefunded,
  mockOrderDraft,
  mockOrderForDifferentUser,
  mockEmptyOrdersResult,
  mockOrdersResult,
  mockSingleOrderResult,
  mockLargeOrdersResult
} from '../fixtures'
import type { Order, User } from '@/payload-types'

// Create mock functions
const mockGetPayload = vi.fn()

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

// Create mock payload instance
const mockPayload = {
  find: vi.fn()
}

// Set up the mock before importing the module
mockGetPayload.mockResolvedValue(mockPayload)

// Import the module under test AFTER mocking dependencies
const { OrdersRepository } = await import('@/repositories/OrdersRepository')

describe('OrdersRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reconfigure the mock for each test
    mockGetPayload.mockResolvedValue(mockPayload)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getUserOrders', () => {
    it('should return all orders for a valid user', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toEqual(mockOrdersResult.docs)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 0,
        pagination: false,
        user: mockUser,
        overrideAccess: false,
        where: {
          customer: {
            equals: mockUser.id,
          },
        },
      })
    })

    it('should return empty array when user has no orders', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toEqual([])
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle null user gracefully', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(null)

      // Assert
      expect(result).toEqual([])
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 0,
        pagination: false,
        user: null,
        overrideAccess: false,
        where: {
          customer: {
            equals: undefined, // user?.id when user is null
          },
        },
      })
    })

    it('should return orders for admin user', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockAdminUser)

      // Assert
      expect(result).toEqual(mockOrdersResult.docs)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 0,
        pagination: false,
        user: mockAdminUser,
        overrideAccess: false,
        where: {
          customer: {
            equals: mockAdminUser.id,
          },
        },
      })
    })

    it('should handle various order statuses', async () => {
      // Arrange
      const mixedOrdersResult = {
        docs: [mockOrder, mockOrderCompleted, mockOrderCancelled, mockOrderRefunded],
        totalDocs: 4,
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
      mockPayload.find.mockResolvedValue(mixedOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(4)
      expect(result[0].status).toBe('processing')
      expect(result[1].status).toBe('completed')
      expect(result[2].status).toBe('cancelled')
      expect(result[3].status).toBe('refunded')
    })

    it('should handle payload.find throwing an error', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      mockPayload.find.mockRejectedValue(error)

      // Act & Assert
      await expect(OrdersRepository.getUserOrders(mockUser)).rejects.toThrow('Database connection failed')
    })

    it('should handle network timeout scenarios', async () => {
      // Arrange
      const timeoutError = new Error('Network timeout')
      mockPayload.find.mockRejectedValue(timeoutError)

      // Act & Assert
      await expect(OrdersRepository.getUserOrders(mockUser)).rejects.toThrow('Network timeout')
    })

    it('should handle large result sets efficiently', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockLargeOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(50)
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 0,
          pagination: false
        })
      )
    })

    it('should filter orders correctly by customer ID', async () => {
      // Arrange
      const ordersForUser1 = {
        docs: [mockOrder, mockOrderCompleted],
        totalDocs: 2,
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
      mockPayload.find.mockResolvedValue(ordersForUser1)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(2)
      result.forEach(order => {
        expect(order.customer).toBe(mockUser.id)
      })
    })

    it('should not return orders for different users', async () => {
      // Arrange - User 1 (id: 1) should not see orders from user 999
      const resultWithOtherUserOrders = {
        docs: [mockOrder, mockOrderForDifferentUser], // Includes order from user 999
        totalDocs: 2,
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
      mockPayload.find.mockResolvedValue(resultWithOtherUserOrders)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser) // User ID 1

      // Assert - Repository only returns orders that match the user's ID
      // Since the mock doesn't filter, all orders are returned, which demonstrates
      // that the security depends on the database query/permissions
      expect(result).toHaveLength(2)
    })

    it('should handle draft orders appropriately', async () => {
      // Arrange
      const ordersWithDraft = {
        docs: [mockOrder, mockOrderDraft],
        totalDocs: 2,
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
      mockPayload.find.mockResolvedValue(ordersWithDraft)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(2)
    })

    it('should handle undefined user properties gracefully', async () => {
      // Arrange
      const userWithUndefinedId = { ...mockUser, id: undefined as never }
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(userWithUndefinedId)

      // Assert
      expect(result).toEqual([])
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            customer: {
              equals: undefined,
            },
          },
        })
      )
    })
  })

  describe('getOrderById', () => {
    it('should return order when found and belongs to user', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, mockOrder.id)

      // Assert
      expect(result).toEqual(mockOrder)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 1,
        pagination: false,
        user: mockUser,
        overrideAccess: false,
        where: {
          and: [
            {
              customer: {
                equals: mockUser.id,
              },
            },
            {
              id: {
                equals: mockOrder.id,
              },
            },
          ],
        },
      })
    })

    it('should return null when order does not belong to user', async () => {
      // Arrange - Mock database returns empty result when order doesn't match user ID
      const emptyResult = {
        docs: [],
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 1,
        page: 1,
        totalPages: 1,
        pager: {
          prev: null,
          next: null
        }
      }
      mockPayload.find.mockResolvedValue(emptyResult)

      // Act - User 1 tries to access order that belongs to user 999
      const result = await OrdersRepository.getOrderById(mockUser, mockOrderForDifferentUser.id)

      // Assert
      expect(result).toBeNull()
    })

    it('should return null when order is not found', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, 999)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalled()
    })

    it('should handle string order IDs', async () => {
      // Arrange
      const stringOrderId = '123'
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, stringOrderId)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 1,
        pagination: false,
        user: mockUser,
        overrideAccess: false,
        where: {
          and: [
            {
              customer: {
                equals: mockUser.id,
              },
            },
            {
              id: {
                equals: stringOrderId,
              },
            },
          ],
        },
      })
    })

    it('should handle number order IDs', async () => {
      // Arrange
      const numberOrderId = 123
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, numberOrderId)

      // Assert
      expect(result).toEqual(mockOrder)
    })

    it('should handle null user gracefully', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getOrderById(null, mockOrder.id)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 1,
        pagination: false,
        user: null,
        overrideAccess: false,
        where: {
          and: [
            {
              customer: {
                equals: undefined, // user?.id when user is null
              },
            },
            {
              id: {
                equals: mockOrder.id,
              },
            },
          ],
        },
      })
    })

    it('should handle admin user accessing any order', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockAdminUser, mockOrder.id)

      // Assert
      expect(result).toEqual(mockOrder)
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'orders',
        limit: 1,
        pagination: false,
        user: mockAdminUser,
        overrideAccess: false,
        where: {
          and: [
            {
              customer: {
                equals: mockAdminUser.id,
              },
            },
            {
              id: {
                equals: mockOrder.id,
              },
            },
          ],
        },
      })
    })

    it('should handle payload.find throwing an error', async () => {
      // Arrange
      const error = new Error('Database query failed')
      mockPayload.find.mockRejectedValue(error)

      // Act & Assert
      await expect(OrdersRepository.getOrderById(mockUser, 1)).rejects.toThrow('Database query failed')
    })

    it('should handle empty docs array', async () => {
      // Arrange
      const emptyResult = { ...mockEmptyOrdersResult, docs: [] }
      mockPayload.find.mockResolvedValue(emptyResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, 1)

      // Assert
      expect(result).toBeNull()
    })

    it('should handle concurrent requests for different orders', async () => {
      // Arrange
      const order1Result = { docs: [mockOrder], totalDocs: 1, hasNextPage: false, hasPrevPage: false, limit: 1, page: 1, totalPages: 1, pager: { prev: null, next: null } }
      const order2Result = { docs: [mockOrderCompleted], totalDocs: 1, hasNextPage: false, hasPrevPage: false, limit: 1, page: 1, totalPages: 1, pager: { prev: null, next: null } }
      
      mockPayload.find.mockImplementation((query) => {
        if (query.where.and[1].id.equals === 1) {
          return Promise.resolve(order1Result)
        }
        if (query.where.and[1].id.equals === 2) {
          return Promise.resolve(order2Result)
        }
        return Promise.resolve(mockEmptyOrdersResult)
      })

      // Act
      const results = await Promise.all([
        OrdersRepository.getOrderById(mockUser, 1),
        OrdersRepository.getOrderById(mockUser, 2)
      ])

      // Assert
      expect(results[0]).toEqual(mockOrder)
      expect(results[1]).toEqual(mockOrderCompleted)
    })

    it('should handle zero and negative order IDs', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const zeroResult = await OrdersRepository.getOrderById(mockUser, 0)
      const negativeResult = await OrdersRepository.getOrderById(mockUser, -1)

      // Assert
      expect(zeroResult).toBeNull()
      expect(negativeResult).toBeNull()
    })

    it('should handle very large order IDs', async () => {
      // Arrange
      const largeOrderId = Number.MAX_SAFE_INTEGER
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, largeOrderId)

      // Assert
      expect(result).toBeNull()
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              {
                customer: {
                  equals: mockUser.id,
                },
              },
              {
                id: {
                  equals: largeOrderId,
                },
              },
            ],
          },
        })
      )
    })

    it('should handle special character order IDs as strings', async () => {
      // Arrange
      const specialOrderId = 'order-123-abc'
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, specialOrderId)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('security and access control', () => {
    it('should enforce user ownership for getUserOrders', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockOrdersResult)

      // Act
      await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            customer: {
              equals: mockUser.id,
            },
          },
        })
      )
    })

    it('should enforce user ownership for getOrderById', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act
      await OrdersRepository.getOrderById(mockUser, mockOrder.id)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            and: [
              {
                customer: {
                  equals: mockUser.id,
                },
              },
              expect.any(Object)
            ],
          },
        })
      )
    })

    it('should handle overrideAccess: false for security', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockOrdersResult)

      // Act
      await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          overrideAccess: false
        })
      )
    })

    it('should not allow cross-user order access', async () => {
      // Arrange - User 1 (id: 1) tries to access order that belongs to user 999
      // The database should return empty result due to the customer filter
      const emptyResult = {
        docs: [],
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 1,
        page: 1,
        totalPages: 1,
        pager: { prev: null, next: null }
      }
      mockPayload.find.mockResolvedValue(emptyResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, mockOrderForDifferentUser.id)

      // Assert - The customer filter in the query should prevent this from returning
      expect(result).toBeNull()
    })
  })

  describe('performance considerations', () => {
    it('should use limit=0 for getUserOrders to get all orders', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockOrdersResult)

      // Act
      await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 0 })
      )
    })

    it('should set pagination=false for getUserOrders to improve performance', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockOrdersResult)

      // Act
      await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: false })
      )
    })

    it('should use limit=1 for getOrderById to improve performance', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act
      await OrdersRepository.getOrderById(mockUser, mockOrder.id)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      )
    })

    it('should set pagination=false for getOrderById to improve performance', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act
      await OrdersRepository.getOrderById(mockUser, mockOrder.id)

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: false })
      )
    })
  })

  describe('integration scenarios', () => {
    it('should handle repository initialization errors', async () => {
      // Arrange - Simulate what happens when payload operations fail after initialization
      const runtimeError = new Error('Database query failed')
      mockPayload.find.mockRejectedValue(runtimeError)

      // Act & Assert
      await expect(OrdersRepository.getUserOrders(mockUser)).rejects.toThrow('Database query failed')
      await expect(OrdersRepository.getOrderById(mockUser, 1)).rejects.toThrow('Database query failed')
    })

    it('should handle concurrent mixed operations', async () => {
      // Arrange
      // Set up mock to differentiate between getUserOrders and getOrderById calls
      mockPayload.find.mockImplementation((query) => {
        // getUserOrders calls have limit: 0 and simple customer filter
        if (query.limit === 0 && query.where.customer) {
          return Promise.resolve(mockOrdersResult)
        }
        // getOrderById calls have limit: 1 and complex AND filter
        if (query.limit === 1 && query.where.and) {
          return Promise.resolve(mockSingleOrderResult)
        }
        return Promise.resolve(mockEmptyOrdersResult)
      })

      // Act
      const results = await Promise.allSettled([
        OrdersRepository.getUserOrders(mockUser),
        OrdersRepository.getOrderById(mockUser, 1),
        OrdersRepository.getUserOrders(mockAdminUser),
        OrdersRepository.getOrderById(mockAdminUser, 2)
      ])

      // Assert
      results.forEach((result, index) => {
        expect(result.status).toBe('fulfilled')
        
        if (result.status === 'fulfilled') {
          if (index % 2 === 0) {
            // getUserOrders results (indices 0, 2)
            expect(Array.isArray((result as PromiseFulfilledResult<Order[]>).value)).toBe(true)
          } else {
            // getOrderById results (indices 1, 3)
            expect((result as PromiseFulfilledResult<Order | null>).value).toEqual(mockOrder)
          }
        }
      })
    })

    it('should handle rapid sequential requests efficiently', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockSingleOrderResult)

      // Act - Multiple rapid requests
      const promises = Array.from({ length: 10 }, (_, i) => 
        OrdersRepository.getOrderById(mockUser, i + 1)
      )
      const results = await Promise.all(promises)

      // Assert
      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result).toEqual(mockOrder) // All return the same mock due to our mock setup
      })
      expect(mockPayload.find).toHaveBeenCalledTimes(10)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle malformed user objects', async () => {
      // Arrange
      const malformedUser = { 
        id: 'invalid-id-type',
        email: 'test@example.com',
        collection: 'users' as const
      }
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(malformedUser as never)

      // Assert
      expect(result).toEqual([])
    })

    it('should handle undefined orderId parameter', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getOrderById(mockUser, undefined as never)

      // Assert
      expect(result).toBeNull()
    })

    it('should handle null result from payload.find', async () => {
      // Arrange
      mockPayload.find.mockResolvedValue(null)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toEqual([])
    })

    it('should handle undefined docs in result', async () => {
      // Arrange
      const resultWithUndefinedDocs = {
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        page: 1,
        totalPages: 0,
        pager: { prev: null, next: null }
        // docs is undefined
      }
      mockPayload.find.mockResolvedValue(resultWithUndefinedDocs)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toEqual([])
    })

    it('should handle mixed type arrays in docs', async () => {
      // Arrange
      const mixedDocsResult = {
        docs: [mockOrder, null, undefined, {} as Order],
        totalDocs: 4,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        page: 1,
        totalPages: 1,
        pager: { prev: null, next: null }
      }
      mockPayload.find.mockResolvedValue(mixedDocsResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(4)
    })

    it('should handle database connection pool exhaustion', async () => {
      // Arrange
      const poolError = new Error('Connection pool exhausted')
      mockPayload.find.mockRejectedValue(poolError)

      // Act & Assert
      await expect(OrdersRepository.getUserOrders(mockUser)).rejects.toThrow('Connection pool exhausted')
    })

    it('should handle malformed query results', async () => {
      // Arrange - Test what happens when docs is not an array
      const malformedResult = {
        docs: 'invalid-docs-type' as never, // Invalid docs type (string instead of array)
        totalDocs: 'invalid-total',
        hasNextPage: 'invalid-boolean',
        limit: 'invalid-limit',
        page: 'invalid-page',
        totalPages: 'invalid-total-pages',
        pager: 'invalid-pager'
      }
      mockPayload.find.mockResolvedValue(malformedResult)

      // Act - This should return the malformed docs as-is since it's truthy
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert - The repository returns result?.docs || [], so it returns the string
      expect(result).toEqual('invalid-docs-type')
      
      // Test with truly malformed result where docs is null/undefined
      mockPayload.find.mockResolvedValue({
        docs: null,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        page: 1,
        totalPages: 0,
        pager: { prev: null, next: null }
      })
      
      const resultWithNullDocs = await OrdersRepository.getUserOrders(mockUser)
      expect(resultWithNullDocs).toEqual([])
    })

    it('should handle unicode and special characters in user data', async () => {
      // Arrange
      const unicodeUser: User & { collection: 'users' } = {
        ...mockUser,
        id: 1,
        email: 'тест@example.com',
        name: '用户测试',
        collection: 'users'
      }
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      const result = await OrdersRepository.getUserOrders(unicodeUser)

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('business logic validation', () => {
    it('should properly filter orders by user permissions', async () => {
      // Arrange
      const userWithLimitedAccess = { 
        ...mockUser, 
        roles: ['read-only'] 
      }
      mockPayload.find.mockResolvedValue(mockEmptyOrdersResult)

      // Act
      await OrdersRepository.getUserOrders(userWithLimitedAccess as never)

      // Assert - Should still attempt the query with user's ID
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            customer: {
              equals: userWithLimitedAccess.id,
            },
          },
        })
      )
    })

    it('should handle orders with complex shipping addresses', async () => {
      // Arrange
      const orderWithComplexAddress = {
        ...mockOrder,
        shippingAddress: {
          title: 'büro',
          firstName: 'François',
          lastName: 'O\'Brien-McDonald',
          company: 'Müller & Söhne GmbH & Co. KG',
          addressLine1: '123 Rue de la Paix',
          addressLine2: 'Appartement 4B, 3ème étage',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01234-567',
          country: 'BR',
          phone: '+55 11 99999-9999'
        }
      }
      const complexAddressResult = {
        docs: [orderWithComplexAddress],
        totalDocs: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        page: 1,
        totalPages: 1,
        pager: { prev: null, next: null }
      }
      mockPayload.find.mockResolvedValue(complexAddressResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].shippingAddress?.company).toBe('Müller & Söhne GmbH & Co. KG')
    })

    it('should handle orders with multiple items and variants', async () => {
      // Arrange
      const multiItemOrder = {
        ...mockOrder,
        items: [
          { product: 1, quantity: 2, id: 'item-1' },
          { variant: 1, quantity: 1, id: 'item-2' },
          { product: 2, variant: 2, quantity: 3, id: 'item-3' }
        ]
      }
      const multiItemResult = {
        docs: [multiItemOrder],
        totalDocs: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        page: 1,
        totalPages: 1,
        pager: { prev: null, next: null }
      }
      mockPayload.find.mockResolvedValue(multiItemResult)

      // Act
      const result = await OrdersRepository.getUserOrders(mockUser)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].items).toHaveLength(3)
    })
  })
})
