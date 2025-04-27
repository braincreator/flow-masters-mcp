'use client'

import React from 'react'
import { 
  useMediaQuery,
  useBreakpoints,
  useDeviceType,
  useOrientation,
  useUserPreferences,
  useViewportSize,
  useResponsiveValue
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  ScreenShare,
  RotateCw,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Check
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

export function MediaQueryExample() {
  // Example using the full context
  const { 
    sm, 
    md, 
    lg, 
    xl, 
    xxl, 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLargeDesktop,
    orientation,
    prefersReducedMotion,
    prefersColorScheme,
    viewportWidth,
    viewportHeight
  } = useMediaQuery()
  
  // Example using selector hooks for better performance
  const breakpoints = useBreakpoints()
  const deviceType = useDeviceType()
  const { isPortrait, isLandscape } = useOrientation()
  const { prefersDarkMode } = useUserPreferences()
  const { aspectRatio } = useViewportSize()
  
  // Example of responsive values
  const fontSize = useResponsiveValue({
    base: '16px',
    sm: '18px',
    md: '20px',
    lg: '22px',
    xl: '24px',
  })
  
  const padding = useResponsiveValue({
    base: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
  })
  
  const columns = useResponsiveValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  })
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Media Query Example</CardTitle>
          <div className="flex gap-2">
            {isMobile && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Mobile
              </Badge>
            )}
            {isTablet && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tablet className="h-3 w-3" />
                Tablet
              </Badge>
            )}
            {isDesktop && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                Desktop
              </Badge>
            )}
            {isLargeDesktop && (
              <Badge variant="outline" className="flex items-center gap-1">
                <ScreenShare className="h-3 w-3" />
                Large Desktop
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          This component demonstrates how to use the MediaQueryProvider
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="breakpoints">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="breakpoints" className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              Breakpoints
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <Sun className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="responsive" className="flex items-center gap-1">
              <Minimize className="h-4 w-4" />
              Responsive
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakpoints" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Breakpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Small (sm): ≥ 640px</span>
                    {breakpoints.sm ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium (md): ≥ 768px</span>
                    {breakpoints.md ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Large (lg): ≥ 1024px</span>
                    {breakpoints.lg ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Extra Large (xl): ≥ 1280px</span>
                    {breakpoints.xl ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2X Large (xxl): ≥ 1536px</span>
                    {breakpoints.xxl ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Device Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mobile</span>
                      {deviceType.isMobile ? (
                        <Smartphone className="h-4 w-4 text-primary" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-muted-foreground opacity-30" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tablet</span>
                      {deviceType.isTablet ? (
                        <Tablet className="h-4 w-4 text-primary" />
                      ) : (
                        <Tablet className="h-4 w-4 text-muted-foreground opacity-30" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Desktop</span>
                      {deviceType.isDesktop ? (
                        <Monitor className="h-4 w-4 text-primary" />
                      ) : (
                        <Monitor className="h-4 w-4 text-muted-foreground opacity-30" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Large Desktop</span>
                      {deviceType.isLargeDesktop ? (
                        <ScreenShare className="h-4 w-4 text-primary" />
                      ) : (
                        <ScreenShare className="h-4 w-4 text-muted-foreground opacity-30" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Orientation & Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Orientation</span>
                      {isPortrait ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <RotateCw className="h-3 w-3" />
                          Portrait
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <RotateCw className="h-3 w-3 rotate-90" />
                          Landscape
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Viewport Width</span>
                      <span className="text-sm font-mono">{viewportWidth}px</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Viewport Height</span>
                      <span className="text-sm font-mono">{viewportHeight}px</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Aspect Ratio</span>
                      <span className="text-sm font-mono">{aspectRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prefers Color Scheme</span>
                    {prefersDarkMode ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Moon className="h-3 w-3" />
                        Dark
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Sun className="h-3 w-3" />
                        Light
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prefers Reduced Motion</span>
                    {prefersReducedMotion ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Responsive Animation Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {prefersReducedMotion ? (
                      <p>Animations are reduced or disabled based on your system preferences.</p>
                    ) : (
                      <p>Animations are enabled based on your system preferences.</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={75} 
                      className={prefersReducedMotion ? "" : "transition-all duration-1000"}
                    />
                    <div 
                      className={`h-12 w-12 bg-primary rounded-full mx-auto ${
                        prefersReducedMotion 
                          ? "" 
                          : "animate-bounce"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="responsive" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Responsive Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Font Size</span>
                    <Badge variant="outline" className="font-mono">{fontSize}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Padding</span>
                    <Badge variant="outline" className="font-mono">{padding}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grid Columns</span>
                    <Badge variant="outline" className="font-mono">{columns}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Responsive Layout Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="grid gap-2"
                  style={{ 
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    fontSize,
                    padding
                  }}
                >
                  {Array.from({ length: columns }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-muted rounded p-2 text-center"
                    >
                      Item {i + 1}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>This grid automatically adjusts columns based on screen size.</p>
                  <p className="mt-1">Try resizing your browser window to see it change.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Using selector hooks for better performance: useBreakpoints, useDeviceType, useResponsiveValue, etc.
        </p>
      </CardFooter>
    </Card>
  )
}
