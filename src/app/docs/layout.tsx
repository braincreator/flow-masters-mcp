import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Flow Masters Documentation',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="docs-layout">
      {children}
    </div>
  )
}
