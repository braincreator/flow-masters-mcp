'use client'

import React, { useState } from 'react'
import { 
  useAuth,
  useBlog,
  useSearch,
  useTheme,
  useLocale,
  useNotifications,
  useUserPreferences,
  useToastNotifications,
  useAppearancePreferences
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  BookOpen, 
  Search, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Settings,
  LogIn,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { LazyLoad } from '@/components/LazyLoad'
import { NotificationsExample } from './NotificationsExample'
import { UserPreferencesExample } from './UserPreferencesExample'

export function ContextProvidersExample() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Use all our context hooks
  const { user, isAuthenticated, login, logout } = useAuth()
  const { posts, fetchPosts } = useBlog()
  const { query, results, search } = useSearch()
  const { theme, switchTheme } = useTheme()
  const { locale, setLocale } = useLocale()
  const { unreadCount } = useNotifications()
  const { preferences } = useUserPreferences()
  const { showToast } = useToastNotifications()
  const { appearance } = useAppearancePreferences()
  
  // Show a toast notification when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    if (value !== 'overview') {
      showToast('info', `Switched to ${value} tab`, `You are now viewing the ${value} section`)
    }
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Context Providers Example</CardTitle>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.name}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => logout()}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              onClick={() => login('demo@example.com', 'password')}
              className="flex items-center gap-1"
            >
              <LogIn className="h-4 w-4" />
              Demo Login
            </Button>
          )}
        </div>
        <CardDescription>
          This component demonstrates how all context providers work together
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-1">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              Theme
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={isAuthenticated ? "success" : "destructive"}>
                        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                      </Badge>
                    </div>
                    {isAuthenticated && user && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">User:</span>
                          <span>{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span>{user.email}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Theme & Locale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Theme:</span>
                      <Badge>
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Locale:</span>
                      <Badge>
                        {locale.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Color Scheme:</span>
                      <Badge>
                        {appearance.colorScheme}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Available Context Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      onClick={() => handleTabChange('notifications')}
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      onClick={() => handleTabChange('preferences')}
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User Preferences
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      onClick={() => handleTabChange('theme')}
                    >
                      <span className="flex items-center gap-2">
                        {theme === 'dark' ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        Theme
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      disabled
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Blog
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      disabled
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between"
                      disabled
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Locale
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <LazyLoad>
              <NotificationsExample />
            </LazyLoad>
          </TabsContent>
          
          <TabsContent value="preferences">
            <LazyLoad>
              <UserPreferencesExample />
            </LazyLoad>
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => switchTheme('light')}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => switchTheme('dark')}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => switchTheme('system')}
                    >
                      <Settings className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Language</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={locale === 'en' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => setLocale('en')}
                    >
                      <span className="text-lg">🇺🇸</span>
                      English
                    </Button>
                    <Button
                      variant={locale === 'ru' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => setLocale('ru')}
                    >
                      <span className="text-lg">🇷🇺</span>
                      Russian
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          All context providers are available throughout the application and can be accessed
          using the useContexts hooks.
        </p>
      </CardFooter>
    </Card>
  )
}
