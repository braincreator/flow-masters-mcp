import React from 'react'
import fs from 'fs'
import path from 'path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Code } from 'lucide-react'

export default function BlocksApiDocPage() {
  // Read the markdown file
  const markdownPath = path.join(process.cwd(), 'src/docs/blocks-api.md')
  const markdown = fs.readFileSync(markdownPath, 'utf8')

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/course-creator" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Course Creator
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/api/blocks" className="flex items-center gap-2" target="_blank">
            <Code className="h-4 w-4" />
            Try API Endpoint
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Blocks API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none py-6">
          <MDXRemote source={markdown} />
        </CardContent>
      </Card>
    </div>
  )
}
