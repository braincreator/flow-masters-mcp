'use client'

import { useState } from 'react'
import { useLoading } from '@/providers/LoadingProvider'
import { useLoadingConfig } from '@/providers/LoadingConfigProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingPreferences } from '@/components/settings/loading-preferences'
import { Loader2, Sparkles, Zap, Gauge } from 'lucide-react'

export default function LoadingDemoPage() {
  const { startLoading, stopLoading, isLoading } = useLoading()
  const { loadingStyle } = useLoadingConfig()
  const [duration, setDuration] = useState(3000)
  
  const handleShowLoading = (ms: number) => {
    startLoading()
    setDuration(ms)
    
    setTimeout(() => {
      stopLoading()
    }, ms)
  }
  
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loading Animations Demo</h1>
          <p className="text-muted-foreground mt-2">
            Test and customize the loading animations used throughout the application
          </p>
        </div>
        
        <Tabs defaultValue="demo">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading Animation Demo</CardTitle>
                <CardDescription>
                  Test the loading animations with different durations
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => handleShowLoading(1000)} 
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Zap className="h-4 w-4" />
                    Quick (1s)
                  </Button>
                  
                  <Button 
                    onClick={() => handleShowLoading(3000)} 
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Gauge className="h-4 w-4" />
                    Medium (3s)
                  </Button>
                  
                  <Button 
                    onClick={() => handleShowLoading(5000)} 
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Sparkles className="h-4 w-4" />
                    Long (5s)
                  </Button>
                </div>
                
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading for {duration/1000}s...
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="text-sm font-medium">Current Settings</div>
                <div className="text-sm text-muted-foreground">
                  Loading Style: <span className="font-medium">{loadingStyle}</span>
                </div>
              </CardFooter>
            </Card>
            
            <div className="text-sm text-muted-foreground">
              <p>
                Note: The loading animation is displayed at the top of the page (progress bar) 
                and/or as a full-screen overlay depending on your settings.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading Animation Settings</CardTitle>
                <CardDescription>
                  Customize how loading animations appear throughout the application
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <LoadingPreferences />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
