'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React from 'react'
import { useAuth } from '@/providers/Auth'

type CollectionKey = 'pages' | 'posts' | 'projects'

type CollectionLabels = {
  [K in CollectionKey]: {
    plural: string
    singular: string
  }
}

const collectionLabels: CollectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const { user } = useAuth()

  // Determine which collection labels to use
  const currentSegment = segments?.[1] || ''
  const collection: CollectionKey = collectionLabels[currentSegment as CollectionKey]
    ? (currentSegment as CollectionKey)
    : 'pages'
  const cmsURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const collectionLabelsData = {
    plural: collectionLabels[collection].plural,
    singular: collectionLabels[collection].singular,
  }

  return (
    <>
      {user ? (
        <div className="bg-black text-white">
          <div className="container">
            <PayloadAdminBar
              {...adminBarProps}
              className="py-2 text-white"
              classNames={{
                controls: 'font-medium text-white',
                logo: 'text-white',
                user: 'text-white',
              }}
              cmsURL={cmsURL}
              collectionLabels={collectionLabelsData}
              logo={<Title />}
              style={{
                backgroundColor: 'transparent',
                padding: 0,
                position: 'relative',
                zIndex: 'unset',
                height:'50px'
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
