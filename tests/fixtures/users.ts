import type { User } from '@/payload-types'

export const mockCurrentUser: User & { collection: 'users' } = {
  collection: 'users',
  id: 1,
  email: 'current.user@example.com',
  name: 'Current User',
  roles: ['customer'],
  orders: {
    docs: [],
    hasNextPage: false,
    totalDocs: 0
  },
  cart: {
    docs: [],
    hasNextPage: false,
    totalDocs: 0
  },
  addresses: {
    docs: [],
    hasNextPage: false,
    totalDocs: 0
  },
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  resetPasswordToken: null,
  resetPasswordExpiration: null,
  salt: null,
  hash: null,
  loginAttempts: null,
  lockUntil: null,
  sessions: null,
  password: null
}

export const mockAdminUser: User & { collection: 'users' } = {
  ...mockCurrentUser,
  id: 2,
  email: 'admin@example.com',
  name: 'Admin User',
  roles: ['admin']
}

export const mockUserWithRoles: User & { collection: 'users' } = {
  ...mockCurrentUser,
  id: 3,
  email: 'customer@domain.com',
  name: 'Customer User',
  roles: ['customer', 'read-only']
}

export const mockAuthResultWithUser = {
  user: mockCurrentUser,
  token: 'mock-jwt-token',
  exp: 1234567890
}

export const mockAuthResultWithoutUser = {
  user: null,
  token: null,
  exp: null
}

export const mockHeaders = {
  authorization: 'Bearer mock-jwt-token',
  'content-type': 'application/json',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

export const mockEmptyHeaders = {}

export const mockInvalidHeaders = {
  authorization: 'Invalid token format',
  'content-type': 'application/json'
}
