import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  params: {
    lang: string
    slug: string
  }
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>
}