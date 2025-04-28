'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw, Search, Server, Database, FileJson } from 'lucide-react'
import EndpointCard from './EndpointCard'
import EndpointTester from './EndpointTester'
import { mcpClient } from '@/lib/mcp-client'

const EndpointBrowser: React.FC = () => {
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [filteredEndpoints, setFilteredEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null)
  const [isTesterOpen, setIsTesterOpen] = useState(false)
  const [serverInfo, setServerInfo] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Fetch endpoints on component mount
  useEffect(() => {
    fetchEndpoints()
    fetchServerInfo()
  }, [])

  // Filter endpoints when search query or method filter changes
  useEffect(() => {
    filterEndpoints()
  }, [searchQuery, methodFilter, endpoints, activeTab])

  const fetchEndpoints = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await mcpClient.getAllEndpoints()
      
      if (response.success) {
        setEndpoints(response.endpoints || [])
      } else {
        setError(response.error || 'Failed to fetch endpoints')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchServerInfo = async () => {
    try {
      const info = await mcpClient.getHealth()
      setServerInfo(info)
    } catch (err) {
      console.error('Failed to fetch server info:', err)
    }
  }

  const refreshEndpoints = async () => {
    setRefreshing(true)
    
    try {
      const response = await mcpClient.refreshEndpoints()
      
      if (response.success) {
        await fetchEndpoints()
      } else {
        setError(response.error || 'Failed to refresh endpoints')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setRefreshing(false)
    }
  }

  const filterEndpoints = () => {
    let filtered = [...endpoints]
    
    // Filter by tab
    if (activeTab === 'api') {
      filtered = filtered.filter(endpoint => endpoint.path.startsWith('/api'))
    } else if (activeTab === 'mcp') {
      filtered = filtered.filter(endpoint => endpoint.path.startsWith('/mcp'))
    } else if (activeTab === 'other') {
      filtered = filtered.filter(endpoint => !endpoint.path.startsWith('/api') && !endpoint.path.startsWith('/mcp'))
    }
    
    // Filter by method
    if (methodFilter !== 'all') {
      filtered = filtered.filter(endpoint => endpoint.method === methodFilter)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(endpoint => 
        endpoint.path.toLowerCase().includes(query) || 
        (endpoint.description && endpoint.description.toLowerCase().includes(query))
      )
    }
    
    setFilteredEndpoints(filtered)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleMethodFilter = (value: string) => {
    setMethodFilter(value)
  }

  const handleTestEndpoint = (endpoint: any) => {
    setSelectedEndpoint(endpoint)
    setIsTesterOpen(true)
  }

  const closeTester = () => {
    setIsTesterOpen(false)
  }

  const getEndpointCounts = () => {
    const apiCount = endpoints.filter(e => e.path.startsWith('/api')).length
    const mcpCount = endpoints.filter(e => e.path.startsWith('/mcp')).length
    const otherCount = endpoints.filter(e => !e.path.startsWith('/api') && !e.path.startsWith('/mcp')).length
    
    return {
      all: endpoints.length,
      api: apiCount,
      mcp: mcpCount,
      other: otherCount
    }
  }

  const counts = getEndpointCounts()

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">API Endpoints Browser</h1>
          <p className="text-muted-foreground">
            Browse and test all available API endpoints
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshEndpoints}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Endpoints
          </Button>
        </div>
      </div>

      {serverInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Server className="h-4 w-4 mr-2" />
                MCP Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge variant={serverInfo.success ? "success" : "destructive"} className="mr-2">
                  {serverInfo.success ? "Online" : "Offline"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  v{serverInfo.version}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Database className="h-4 w-4 mr-2" />
                API Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge variant={serverInfo.success ? "success" : "destructive"} className="mr-2">
                  {serverInfo.success ? "Connected" : "Disconnected"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {serverInfo.apiConfig?.apiVersion || 'v1'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileJson className="h-4 w-4 mr-2" />
                Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {serverInfo.endpointsCount || endpoints.length}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Total endpoints available
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center">
                All
                <Badge variant="outline" className="ml-2">{counts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center">
                API
                <Badge variant="outline" className="ml-2">{counts.api}</Badge>
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex items-center">
                MCP
                <Badge variant="outline" className="ml-2">{counts.mcp}</Badge>
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center">
                Other
                <Badge variant="outline" className="ml-2">{counts.other}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex w-full md:w-auto gap-2">
              <div className="w-full md:w-auto">
                <Select value={methodFilter} onValueChange={handleMethodFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search endpoints..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderEndpointsList()}
          </TabsContent>
          
          <TabsContent value="api" className="mt-0">
            {renderEndpointsList()}
          </TabsContent>
          
          <TabsContent value="mcp" className="mt-0">
            {renderEndpointsList()}
          </TabsContent>
          
          <TabsContent value="other" className="mt-0">
            {renderEndpointsList()}
          </TabsContent>
        </Tabs>
      </div>

      {selectedEndpoint && (
        <EndpointTester
          endpoint={selectedEndpoint}
          isOpen={isTesterOpen}
          onClose={closeTester}
        />
      )}
    </div>
  )

  function renderEndpointsList() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading endpoints...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Endpoints</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={fetchEndpoints}
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (filteredEndpoints.length === 0) {
      return (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-semibold mb-2">No Endpoints Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || methodFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No endpoints are available'}
          </p>
          {(searchQuery || methodFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setMethodFilter('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )
    }

    return (
      <div>
        {filteredEndpoints.map((endpoint, index) => (
          <EndpointCard 
            key={`${endpoint.method}-${endpoint.path}-${index}`}
            endpoint={endpoint}
            onTest={handleTestEndpoint}
          />
        ))}
      </div>
    )
  }
}

export default EndpointBrowser
