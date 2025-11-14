import type { Order } from '@/payload-types'

export const mockOrder: Order = {
  id: 1,
  items: [
    {
      product: 1,
      quantity: 2,
      id: 'item-1'
    },
    {
      product: 2,
      variant: 1,
      quantity: 1,
      id: 'item-2'
    }
  ],
  shippingAddress: {
    title: 'Home',
    firstName: 'John',
    lastName: 'Doe',
    company: null,
    addressLine1: '123 Main St',
    addressLine2: 'Apt 1',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '+1234567890'
  },
  customer: 1,
  customerEmail: 'test@example.com',
  transactions: [1],
  status: 'processing',
  amount: 99.98,
  currency: 'USD',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z'
}

export const mockOrderCompleted: Order = {
  ...mockOrder,
  id: 2,
  status: 'completed',
  amount: 49.99
}

export const mockOrderCancelled: Order = {
  ...mockOrder,
  id: 3,
  status: 'cancelled',
  amount: 29.99
}

export const mockOrderRefunded: Order = {
  ...mockOrder,
  id: 4,
  status: 'refunded',
  amount: 149.97
}

export const mockOrderDraft: Order = {
  ...mockOrder,
  id: 5,
  status: 'processing' as const,
  customer: null,
  customerEmail: null
}

export const mockEmptyOrdersResult = {
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

export const mockOrdersResult = {
  docs: [mockOrder, mockOrderCompleted, mockOrderCancelled],
  totalDocs: 3,
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

export const mockSingleOrderResult = {
  docs: [mockOrder],
  totalDocs: 1,
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

export const mockLargeOrdersResult = {
  docs: Array.from({ length: 50 }, (_, i) => ({
    ...mockOrder,
    id: i + 1,
    amount: 50 + i
  })),
  totalDocs: 50,
  hasNextPage: true,
  hasPrevPage: false,
  limit: 10,
  page: 1,
  totalPages: 5,
  pager: {
    prev: null,
    next: 2
  }
}

export const mockOrderForDifferentUser: Order = {
  id: 10,
  items: [
    {
      product: 3,
      quantity: 1,
      id: 'item-10'
    }
  ],
  shippingAddress: {
    title: 'Office',
    firstName: 'Jane',
    lastName: 'Smith',
    addressLine1: '456 Business Ave',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'US'
  },
  customer: 999, // Different user ID
  customerEmail: 'different@example.com',
  status: 'processing',
  amount: 25.00,
  currency: 'USD',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z'
}
