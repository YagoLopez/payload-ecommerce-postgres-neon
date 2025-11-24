'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'

type CartUIContextType = {
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined)

export const CartUIProvider = ({ children }: { children: ReactNode }) => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <CartUIContext.Provider value={{ isCartOpen, setIsCartOpen, isLoading, setIsLoading }}>
      {children}
    </CartUIContext.Provider>
  )
}

export const useCartUI = () => {
  const context = useContext(CartUIContext)
  if (context === undefined) {
    throw new Error('useCartUI must be used within a CartUIProvider')
  }
  return context
}
