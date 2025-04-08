'use client'

import React from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'

// Sample content block data for testing
const testBlocks = [
  {
    blockType: 'content',
    columns: [
      {
        size: 'full',
        richText: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'This is a test content block',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'If you can see this text, content blocks are working!',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        enableActions: true,
        actions: [
          {
            actionType: 'button',
            label: 'Test Button',
            appearance: 'primary',
          },
        ],
      },
    ],
  },
  {
    blockType: 'cta',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'This is a CTA block',
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    actions: [
      {
        actionType: 'button',
        label: 'Call to Action',
        appearance: 'primary',
      },
    ],
  },
]

export default function TestBlocksPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Test Content Blocks</h1>
      
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p>This page tests the rendering of content blocks. If you see content below, the blocks are working correctly.</p>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 p-4 rounded mb-8">
        <h2 className="text-xl font-semibold mb-4">Content Blocks Test Area:</h2>
        <RenderBlocks blocks={testBlocks} />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Debug Information:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(testBlocks, null, 2)}
        </pre>
      </div>
    </div>
  )
}
