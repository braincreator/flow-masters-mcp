'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  // Create a wrapper div with the className
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Override default components for better styling
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm mb-3">
                <code className={cn('text-sm font-mono', className)} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground my-2"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => <hr className="my-4 border-muted" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-3">
              <table className="border-collapse w-full text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-muted bg-muted px-3 py-2 text-left font-medium"
              {...props}
            />
          ),
          td: ({ node, ...props }) => <td className="border border-muted px-3 py-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
