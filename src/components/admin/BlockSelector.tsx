'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Blocks, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Block {
  id: string
  name: string
  description: string
  type: string
}

interface BlockSelectorProps {
  selectedBlocks: Block[]
  onSelect: (blocks: Block[]) => void
}

export default function BlockSelector({ selectedBlocks, onSelect }: BlockSelectorProps) {
  const [availableBlocks, setAvailableBlocks] = React.useState<Block[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/blocks?usage=landing`)
        if (!response.ok) {
          throw new Error('Failed to fetch blocks')
        }
        const data = await response.json()
        setAvailableBlocks(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBlocks()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        Error loading blocks: {error}
      </div>
    )
  }
  const toggleBlock = (block: Block) => {
    if (selectedBlocks.some(b => b.id === block.id)) {
      onSelect(selectedBlocks.filter(b => b.id !== block.id))
    } else {
      onSelect([...selectedBlocks, block])
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableBlocks.length > 0 ? (
          availableBlocks.map((block) => (
            <Card
              key={block.id}
              className="hover:shadow-md transition-shadow border border-gray-200"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{block.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBlock(block)}
                  >
                    {selectedBlocks.some((b) => b.id === block.id) ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <Plus className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{block.description}</p>
                <Badge variant="outline" className="mt-2">
                  {block.type}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <div>No blocks available.</div>
        )}
      </div>

      {selectedBlocks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            Выбранные блоки ({selectedBlocks.length})
          </h3>
          <div className="space-y-2">
            {selectedBlocks.map(block => (
              <div key={block.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium">{block.name}</p>
                  <p className="text-sm text-muted-foreground">{block.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBlock(block)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}