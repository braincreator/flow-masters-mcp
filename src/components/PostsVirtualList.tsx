'use client'

import React, { lazy } from 'react'
import { VirtualList } from '@/components/VirtualList'

const LazyCollectionArchive = lazy(() =>
  import('@/components/CollectionArchive').then((mod) => ({
    default: mod.CollectionArchive,
  })),
)

interface PostsVirtualListProps {
  posts: any[]
  className?: string
}

export function PostsVirtualList({ posts, className }: PostsVirtualListProps) {
  const renderItem = (post: any) => <LazyCollectionArchive posts={[post]} />

  return (
    <VirtualList items={posts} itemHeight={300} renderItem={renderItem} className={className} />
  )
}
