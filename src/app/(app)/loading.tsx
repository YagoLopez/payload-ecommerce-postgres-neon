import React from 'react'

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status">
        <div aria-hidden="true" className="animate-spin rounded-full border-4 border-solid border-primary border-t-transparent h-12 w-12" />
        <p className="text-muted-foreground text-sm font-medium">
          Loading...
        </p>
      </div>
    </div>
  )
}
