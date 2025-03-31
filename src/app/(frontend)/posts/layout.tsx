import React from 'react'
import PageClient from './page.client'

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageClient />
      {children}
    </>
  )
}
