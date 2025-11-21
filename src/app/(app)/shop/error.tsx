'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  useEffect(() => {
    console.error('Shop page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn&#39;t load the products. This might be a network issue or the products might be temporarily unavailable.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button 
          onClick={() => router.push('/')}
          variant="outline"
        >
          Go Home
        </Button>
      </div>
    </div>
  )
}
