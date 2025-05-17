export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  )
}
