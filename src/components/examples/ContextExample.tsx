'use client'

import React from 'react'
import {
  useAuth,
  useBlog,
  useSearch,
  useTheme,
  useLocale,
  useCache,
} from '@/hooks/useContexts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Moon, Sun, Globe, Search, User, BookOpen } from 'lucide-react'

export function ContextExample() {
  // Use all our context hooks
  const { user, isAuthenticated, login, logout } = useAuth()
  const { posts, fetchPosts, searchQuery, setSearchQuery } = useBlog()
  const { query, results, search } = useSearch()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, formatDate } = useLocale()
  const cache = useCache()
  
  // Example search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Context Providers Example</CardTitle>
        <CardDescription>
          This component demonstrates how to use all the context providers
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="auth">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="auth"><User className="mr-2 h-4 w-4" /> Auth</TabsTrigger>
            <TabsTrigger value="blog"><BookOpen className="mr-2 h-4 w-4" /> Blog</TabsTrigger>
            <TabsTrigger value="search"><Search className="mr-2 h-4 w-4" /> Search</TabsTrigger>
            <TabsTrigger value="theme"><Sun className="mr-2 h-4 w-4" /> Theme</TabsTrigger>
            <TabsTrigger value="locale"><Globe className="mr-2 h-4 w-4" /> Locale</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auth" className="space-y-4">
            <h3 className="text-lg font-medium">Authentication</h3>
            {isAuthenticated ? (
              <div className="space-y-4">
                <p>Logged in as: {user?.name}</p>
                <p>Email: {user?.email}</p>
                <Button onClick={() => logout()}>Logout</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Not logged in</p>
                <div className="flex gap-2">
                  <Button onClick={() => login('demo@example.com', 'password')}>
                    Demo Login
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="blog" className="space-y-4">
            <h3 className="text-lg font-medium">Blog</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => fetchPosts()}>Fetch Posts</Button>
            </div>
            
            <div className="space-y-2">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="p-4 border rounded">
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  </div>
                ))
              ) : (
                <p>No posts found. Try fetching posts.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <h3 className="text-lg font-medium">Search</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search everything..."
                value={query}
                onChange={(e) => search(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
            
            <div className="space-y-2">
              {results.length > 0 ? (
                results.map((result) => (
                  <div key={result.id} className="p-4 border rounded">
                    <h4 className="font-medium">{result.title}</h4>
                    <p className="text-sm text-muted-foreground">{result.excerpt}</p>
                  </div>
                ))
              ) : (
                <p>No search results. Try searching for something.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-4">
            <h3 className="text-lg font-medium">Theme</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                <Moon className="h-4 w-4" />
                System
              </Button>
            </div>
            
            <p>Current theme: {theme}</p>
          </TabsContent>
          
          <TabsContent value="locale" className="space-y-4">
            <h3 className="text-lg font-medium">Locale</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                onClick={() => setLocale('en')}
                className="flex items-center gap-2"
              >
                <span className="text-lg">🇺🇸</span>
                English
              </Button>
              
              <Button
                variant={locale === 'ru' ? 'default' : 'outline'}
                onClick={() => setLocale('ru')}
                className="flex items-center gap-2"
              >
                <span className="text-lg">🇷🇺</span>
                Русский
              </Button>
            </div>
            
            <p>Current locale: {locale}</p>
            <p>Formatted date: {formatDate(new Date())}</p>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          All context providers are available throughout the application
        </p>
      </CardFooter>
    </Card>
  )
}
