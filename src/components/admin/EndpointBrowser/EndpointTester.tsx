'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mcpClient } from '@/lib/mcp-client'
import { Loader2 } from 'lucide-react'

interface EndpointTesterProps {
  endpoint: any
  isOpen: boolean
  onClose: () => void
}

const EndpointTester: React.FC<EndpointTesterProps> = ({ endpoint, isOpen, onClose }) => {
  const [method, setMethod] = useState(endpoint?.method || 'GET')
  const [path, setPath] = useState(endpoint?.path || '')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('request')

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      let data = null
      if (requestBody && requestBody.trim() !== '') {
        try {
          data = JSON.parse(requestBody)
        } catch (e) {
          setError('Invalid JSON in request body')
          setLoading(false)
          return
        }
      }
      
      const result = await mcpClient.proxyRequest(method, path, data)
      setResponse(result)
      setActiveTab('response')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2)
    } catch (e) {
      return 'Error formatting JSON'
    }
  }

  const handleReset = () => {
    setMethod(endpoint?.method || 'GET')
    setPath(endpoint?.path || '')
    setRequestBody('')
    setResponse(null)
    setError(null)
    setActiveTab('request')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge>{method}</Badge>
            <span className="font-mono">{path}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="method">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/v1/example"
                />
              </div>
            </div>

            {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
              <div>
                <Label htmlFor="body">Request Body (JSON)</Label>
                <Textarea
                  id="body"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="font-mono h-40"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="response" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Sending request...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                <h4 className="font-semibold mb-2">Error</h4>
                <p>{error}</p>
              </div>
            ) : response ? (
              <div>
                <Label>Response</Label>
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto font-mono text-sm mt-2 border">
                  {formatJson(response)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Send a request to see the response here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={handleReset} className="mr-2">
              Reset
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Close
            </Button>
            <Button onClick={handleTest} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                'Test Endpoint'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EndpointTester
