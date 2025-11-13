'use client'

import { useTheme } from '@/providers/Theme'
import { Toaster } from 'sonner'
import { ReactNode } from 'react'

export const SonnerProvider = ({ children }: { children?: ReactNode }) => {
  const { theme } = useTheme()

  return (
    <>
      {children}

      <Toaster richColors position="top-right" theme={theme || 'light'} />
    </>
  )
}
