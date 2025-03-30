import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import PageClient from './page.client'
import { PostsVirtualList } from '@/components/PostsVirtualList'
import PaginationRenderer from '@/components/PaginationRenderer'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  // Убедимся что у нас есть данные о пагинации
  const currentPage = posts.page || 1
  const totalPages = posts.totalPages || 1

  return (
    <div className="pb-24 flex flex-col">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <Suspense fallback={<div className="flex-grow">Loading posts...</div>} className="flex-grow">
        <PostsVirtualList posts={posts.docs} className="flex-grow" />
      </Suspense>

      <PaginationRenderer>
        <Pagination page={currentPage} totalPages={totalPages} />
      </PaginationRenderer>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
