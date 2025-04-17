import React from 'react'
import fs from 'fs'
import path from 'path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import '@/app/globals.css'

export default async function ApiDocsPage() {
  // Чтение файла документации
  const docsPath = path.join(process.cwd(), 'src/app/(admin)/admin/course-creator/api-docs.mdx')
  const mdxContent = fs.readFileSync(docsPath, 'utf8')

  return (
    <html>
      <body>
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">API документация</h1>
            <Button asChild>
              <Link href="/admin/course-creator">Вернуться к созданию курса</Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>API для создания курсов из внешнего контента</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <MDXRemote source={mdxContent} />
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
