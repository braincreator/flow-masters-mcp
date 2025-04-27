'use client'

import React, { useState } from 'react'
import { 
  useAnalytics,
  useBasicTracking,
  useEcommerceTracking,
  useAnalyticsDebug
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  ShoppingCart, 
  User, 
  FileText, 
  MousePointer, 
  Trash2,
  Clock
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function AnalyticsExample() {
  // Example using the full context
  const { trackEvent, trackPageView, trackEcommerce, trackUserAction } = useAnalytics()
  
  // Example using selector hooks for better performance
  const { trackEvent: trackBasicEvent } = useBasicTracking()
  const { trackEcommerce: trackEcommerceEvent } = useEcommerceTracking()
  const { recentEvents, clearRecentEvents } = useAnalyticsDebug()
  
  // Form state
  const [eventCategory, setEventCategory] = useState('interaction')
  const [eventAction, setEventAction] = useState('click')
  const [eventLabel, setEventLabel] = useState('example-button')
  const [eventValue, setEventValue] = useState('10')
  
  // Ecommerce form state
  const [ecommerceAction, setEcommerceAction] = useState('view_item')
  const [productId, setProductId] = useState('prod-123')
  const [productName, setProductName] = useState('Example Product')
  const [productPrice, setProductPrice] = useState('99.99')
  
  // Handle tracking a basic event
  const handleTrackEvent = () => {
    trackBasicEvent(
      eventCategory as any, 
      eventAction, 
      eventLabel, 
      eventValue ? parseInt(eventValue) : undefined
    )
  }
  
  // Handle tracking an ecommerce event
  const handleTrackEcommerce = () => {
    trackEcommerceEvent({
      action: ecommerceAction as any,
      items: [
        {
          id: productId,
          name: productName,
          price: productPrice ? parseFloat(productPrice) : undefined,
          quantity: 1
        }
      ],
      value: productPrice ? parseFloat(productPrice) : undefined,
      currency: 'USD'
    })
  }
  
  // Handle tracking a page view
  const handleTrackPageView = () => {
    trackPageView('/example-page', 'Example Page')
  }
  
  // Handle tracking a user action
  const handleTrackUserAction = () => {
    trackUserAction('profile_update', {
      fields_updated: ['name', 'email'],
      time_spent: 45
    })
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Analytics Example</CardTitle>
        <CardDescription>
          This component demonstrates how to use the AnalyticsProvider
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="track">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="track">Track Events</TabsTrigger>
            <TabsTrigger value="debug">Debug Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="track" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Basic Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="event-category">Event Category</Label>
                    <Select value={eventCategory} onValueChange={setEventCategory}>
                      <SelectTrigger id="event-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page_view">Page View</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="ecommerce">Ecommerce</SelectItem>
                        <SelectItem value="interaction">Interaction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="event-action">Event Action</Label>
                    <Input 
                      id="event-action" 
                      value={eventAction} 
                      onChange={(e) => setEventAction(e.target.value)} 
                      placeholder="e.g., click, submit, view"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event-label">Event Label (optional)</Label>
                    <Input 
                      id="event-label" 
                      value={eventLabel} 
                      onChange={(e) => setEventLabel(e.target.value)} 
                      placeholder="e.g., homepage-button"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event-value">Event Value (optional)</Label>
                    <Input 
                      id="event-value" 
                      value={eventValue} 
                      onChange={(e) => setEventValue(e.target.value)} 
                      placeholder="e.g., 10"
                      type="number"
                    />
                  </div>
                  
                  <Button onClick={handleTrackEvent} className="w-full">
                    Track Event
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Ecommerce Event
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="ecommerce-action">Action</Label>
                    <Select value={ecommerceAction} onValueChange={setEcommerceAction}>
                      <SelectTrigger id="ecommerce-action">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view_item">View Item</SelectItem>
                        <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                        <SelectItem value="remove_from_cart">Remove from Cart</SelectItem>
                        <SelectItem value="begin_checkout">Begin Checkout</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="product-id">Product ID</Label>
                    <Input 
                      id="product-id" 
                      value={productId} 
                      onChange={(e) => setProductId(e.target.value)} 
                      placeholder="e.g., prod-123"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input 
                      id="product-name" 
                      value={productName} 
                      onChange={(e) => setProductName(e.target.value)} 
                      placeholder="e.g., Premium Widget"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="product-price">Price</Label>
                    <Input 
                      id="product-price" 
                      value={productPrice} 
                      onChange={(e) => setProductPrice(e.target.value)} 
                      placeholder="e.g., 99.99"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  
                  <Button onClick={handleTrackEcommerce} className="w-full">
                    Track Ecommerce
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleTrackPageView}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Track Page View
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleTrackUserAction}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Track User Action
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Recent Events ({recentEvents.length})</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearRecentEvents}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
            
            {recentEvents.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentEvents.map((event, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {event.category === 'page_view' && <FileText className="h-4 w-4" />}
                        {event.category === 'user' && <User className="h-4 w-4" />}
                        {event.category === 'ecommerce' && <ShoppingCart className="h-4 w-4" />}
                        {event.category === 'interaction' && <MousePointer className="h-4 w-4" />}
                        {event.category === 'content' && <FileText className="h-4 w-4" />}
                        <span className="font-medium">{event.action}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="text-muted-foreground">Category:</div>
                      <div>{event.category}</div>
                      
                      {event.label && (
                        <>
                          <div className="text-muted-foreground">Label:</div>
                          <div>{event.label}</div>
                        </>
                      )}
                      
                      {event.value !== undefined && (
                        <>
                          <div className="text-muted-foreground">Value:</div>
                          <div>{event.value}</div>
                        </>
                      )}
                      
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <>
                          <div className="text-muted-foreground col-span-2 mt-1">Properties:</div>
                          <div className="col-span-2 bg-muted/50 p-2 rounded text-xs font-mono">
                            {JSON.stringify(event.properties, null, 2)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <BarChart3 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No events tracked yet</p>
                <p className="text-sm mt-1">Try tracking some events in the "Track Events" tab</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Using selector hooks for better performance: useBasicTracking, useEcommerceTracking, useAnalyticsDebug
        </p>
      </CardFooter>
    </Card>
  )
}
