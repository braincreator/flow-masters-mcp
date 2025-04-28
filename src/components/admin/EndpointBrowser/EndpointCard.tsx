'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Play, Code, Copy, Check } from 'lucide-react'

interface EndpointCardProps {
  endpoint: {
    path: string
    method: string
    description?: string
    parameters?: Array<{
      name: string
      type: string
      required: boolean
      description?: string
    }>
    security?: boolean
    tags?: string[]
  }
  onTest: (endpoint: any) => void
}

const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint, onTest }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const methodColors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  }

  const methodColor = methodColors[endpoint.method] || 'bg-gray-100 text-gray-800'

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpoint.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={methodColor}>{endpoint.method}</Badge>
              {endpoint.security && <Badge variant="outline">Requires Auth</Badge>}
            </div>
            <CardTitle className="text-lg font-mono">{endpoint.path}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyEndpoint}
              className="h-8 px-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTest(endpoint)}
              className="h-8 px-2"
            >
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
          </div>
        </div>
        {endpoint.description && (
          <CardDescription>{endpoint.description}</CardDescription>
        )}
      </CardHeader>

      {(endpoint.parameters?.length > 0 || endpoint.tags?.length > 0) && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full flex justify-center items-center py-1">
              {isOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {endpoint.parameters?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-start">
                          <span className="font-mono font-medium">{param.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {param.type}
                          </Badge>
                          {param.required && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {param.description && (
                          <p className="text-muted-foreground text-xs mt-1">{param.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.tags?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {endpoint.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}

      <CardFooter className="pt-0 pb-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Code className="h-3 w-3 mr-1" />
          <span className="font-mono">{`${endpoint.method} ${endpoint.path}`}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export default EndpointCard
