'use client'

import React from 'react'
import { 
  useUserPreferences,
  useEmailNotificationPreferences,
  useAccessibilityPreferences,
  useAppearancePreferences
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Mail, 
  Bell, 
  Eye, 
  Lock, 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Type, 
  RotateCcw
} from 'lucide-react'

export function UserPreferencesExample() {
  // Example using the full context
  const { preferences, isLoading, resetPreferences } = useUserPreferences()
  
  // Example using selector hooks for better performance
  const { 
    emailNotifications, 
    updateEmailNotifications 
  } = useEmailNotificationPreferences()
  
  const { 
    accessibility, 
    updateAccessibility, 
    resetAccessibility 
  } = useAccessibilityPreferences()
  
  const { 
    appearance, 
    updateAppearance 
  } = useAppearancePreferences()
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="py-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>User Preferences Example</CardTitle>
        <CardDescription>
          This component demonstrates how to use the UserPreferencesProvider
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notification Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="account-emails" className="flex-1">
                    Account notifications
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your account activity and security
                    </p>
                  </Label>
                  <Switch
                    id="account-emails"
                    checked={emailNotifications.account}
                    onCheckedChange={(checked) => 
                      updateEmailNotifications({ account: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="security-emails" className="flex-1">
                    Security alerts
                    <p className="text-sm text-muted-foreground">
                      Receive emails about suspicious activity and security updates
                    </p>
                  </Label>
                  <Switch
                    id="security-emails"
                    checked={emailNotifications.security}
                    onCheckedChange={(checked) => 
                      updateEmailNotifications({ security: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="product-emails" className="flex-1">
                    Product updates
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and improvements
                    </p>
                  </Label>
                  <Switch
                    id="product-emails"
                    checked={emailNotifications.productUpdates}
                    onCheckedChange={(checked) => 
                      updateEmailNotifications({ productUpdates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails" className="flex-1">
                    Marketing emails
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new products, offers, and promotions
                    </p>
                  </Label>
                  <Switch
                    id="marketing-emails"
                    checked={emailNotifications.marketing}
                    onCheckedChange={(checked) => 
                      updateEmailNotifications({ marketing: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter-emails" className="flex-1">
                    Newsletter
                    <p className="text-sm text-muted-foreground">
                      Receive our weekly newsletter with the latest updates
                    </p>
                  </Label>
                  <Switch
                    id="newsletter-emails"
                    checked={emailNotifications.newsletter}
                    onCheckedChange={(checked) => 
                      updateEmailNotifications({ newsletter: checked })
                    }
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Label className="mb-2 block">Email frequency</Label>
                <Select
                  value={preferences.notificationFrequency}
                  onValueChange={(value) => 
                    updateEmailNotifications({ 
                      // This is just for the example, in a real app you would use
                      // updatePreferences({ notificationFrequency: value as any })
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly digest</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="accessibility" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Accessibility Settings</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => resetAccessibility()}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="flex-1">
                  Reduce motion
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={accessibility.reduceMotion}
                  onCheckedChange={(checked) => 
                    updateAccessibility({ reduceMotion: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex-1">
                  High contrast
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </Label>
                <Switch
                  id="high-contrast"
                  checked={accessibility.highContrast}
                  onCheckedChange={(checked) => 
                    updateAccessibility({ highContrast: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="flex-1">
                  Large text
                  <p className="text-sm text-muted-foreground">
                    Increase text size throughout the application
                  </p>
                </Label>
                <Switch
                  id="large-text"
                  checked={accessibility.largeText}
                  onCheckedChange={(checked) => 
                    updateAccessibility({ largeText: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader" className="flex-1">
                  Screen reader optimizations
                  <p className="text-sm text-muted-foreground">
                    Optimize the interface for screen readers
                  </p>
                </Label>
                <Switch
                  id="screen-reader"
                  checked={accessibility.screenReader}
                  onCheckedChange={(checked) => 
                    updateAccessibility({ screenReader: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav" className="flex-1">
                  Keyboard navigation
                  <p className="text-sm text-muted-foreground">
                    Enhanced keyboard navigation support
                  </p>
                </Label>
                <Switch
                  id="keyboard-nav"
                  checked={accessibility.keyboardNavigation}
                  onCheckedChange={(checked) => 
                    updateAccessibility({ keyboardNavigation: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <h3 className="text-lg font-medium">Appearance Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={appearance.theme === 'light' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => updateAppearance({ theme: 'light' })}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={appearance.theme === 'dark' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => updateAppearance({ theme: 'dark' })}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={appearance.theme === 'system' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => updateAppearance({ theme: 'system' })}
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Color Scheme</Label>
                <Select
                  value={appearance.colorScheme}
                  onValueChange={(value) => 
                    updateAppearance({ colorScheme: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">Font Size</Label>
                <Select
                  value={appearance.fontSize}
                  onValueChange={(value) => 
                    updateAppearance({ fontSize: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">Font Family</Label>
                <Select
                  value={appearance.fontFamily}
                  onValueChange={(value) => 
                    updateAppearance({ fontFamily: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-animations" className="flex-1">
                  Reduced animations
                  <p className="text-sm text-muted-foreground">
                    Minimize animations throughout the application
                  </p>
                </Label>
                <Switch
                  id="reduced-animations"
                  checked={appearance.reducedAnimations}
                  onCheckedChange={(checked) => 
                    updateAppearance({ reducedAnimations: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Using selector hooks for better performance
        </p>
        <Button 
          variant="outline" 
          onClick={() => resetPreferences()}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All Preferences
        </Button>
      </CardFooter>
    </Card>
  )
}
