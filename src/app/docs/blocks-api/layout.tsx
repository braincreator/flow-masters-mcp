import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blocks API Documentation',
  description: 'Documentation for the Blocks API',
}

export default function BlocksApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blocks-api-layout">
      {children}
    </div>
  )
}
