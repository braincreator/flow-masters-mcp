'use client'

import React, { useState } from 'react'
import { AnalyticsExample } from '@/components/examples/AnalyticsExample'
import { PermissionsExample } from '@/components/examples/PermissionsExample'
import { MediaQueryExample } from '@/components/examples/MediaQueryExample'
import { NotificationsExample } from '@/components/examples/NotificationsExample'
import { UserPreferencesExample } from '@/components/examples/UserPreferencesExample'
import { ContextProvidersExample } from '@/components/examples/ContextProvidersExample'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  ShieldCheck, 
  Smartphone, 
  Bell, 
  User, 
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LazyLoad } from '@/components/LazyLoad'
import { useToastNotifications } from '@/hooks/useContexts'

export default function ContextProvidersPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { showToast } = useToastNotifications()
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    if (value !== 'overview') {
      showToast('info', `Viewing ${value} example`, `You are now exploring the ${value} context provider`)
    }
  }
  
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Context Providers Examples</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore the various context providers available in the application. Each provider
          offers a different set of functionality and can be used with selector hooks for
          optimized performance.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="mediaquery" className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              Media Query
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-4">
          <LazyLoad>
            <ContextProvidersExample />
          </LazyLoad>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[
              { id: 'analytics', name: 'Analytics Provider', icon: <BarChart3 className="h-5 w-5" /> },
              { id: 'permissions', name: 'Permissions Provider', icon: <ShieldCheck className="h-5 w-5" /> },
              { id: 'mediaquery', name: 'Media Query Provider', icon: <Smartphone className="h-5 w-5" /> },
              { id: 'notifications', name: 'Notifications Provider', icon: <Bell className="h-5 w-5" /> },
              { id: 'preferences', name: 'User Preferences Provider', icon: <User className="h-5 w-5" /> },
            ].map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => handleTabChange(provider.id)}
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  {provider.icon}
                </div>
                <span className="font-medium">{provider.name}</span>
                <span className="text-xs text-muted-foreground">Click to explore</span>
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="flex justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleTabChange('overview')}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </div>
          
          <LazyLoad>
            <AnalyticsExample />
          </LazyLoad>
        </TabsContent>
        
        <TabsContent value="permissions">
          <div className="flex justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleTabChange('overview')}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </div>
          
          <LazyLoad>
            <PermissionsExample />
          </LazyLoad>
        </TabsContent>
        
        <TabsContent value="mediaquery">
          <div className="flex justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleTabChange('overview')}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </div>
          
          <LazyLoad>
            <MediaQueryExample />
          </LazyLoad>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="flex justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleTabChange('overview')}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </div>
          
          <LazyLoad>
            <NotificationsExample />
          </LazyLoad>
        </TabsContent>
        
        <TabsContent value="preferences">
          <div className="flex justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleTabChange('overview')}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </div>
          
          <LazyLoad>
            <UserPreferencesExample />
          </LazyLoad>
        </TabsContent>
      </Tabs>
    </div>
  )
}
