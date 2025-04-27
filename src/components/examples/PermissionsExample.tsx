'use client'

import React from 'react'
import { 
  usePermissions,
  usePermissionChecks,
  useUserRole,
  useContentPermissions,
  useProductPermissions,
  useOrderPermissions
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldCheck, 
  ShieldX, 
  User, 
  FileText, 
  ShoppingBag, 
  Package, 
  Settings,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export function PermissionsExample() {
  // Example using the full context
  const { 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission, 
    userRole, 
    userPermissions, 
    isAdmin,
    PermissionGuard
  } = usePermissions()
  
  // Example using selector hooks for better performance
  const { hasPermission: checkPermission } = usePermissionChecks()
  const { userRole: role, isAdmin: admin } = useUserRole()
  const contentPermissions = useContentPermissions()
  const productPermissions = useProductPermissions()
  const orderPermissions = useOrderPermissions()
  
  // Permission check examples
  const canManageUsers = hasPermission('manage:roles')
  const canEditContent = hasAllPermissions(['create:post', 'edit:post'])
  const canViewAnalytics = hasPermission('view:analytics')
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Permissions Example</CardTitle>
          <Badge variant={isAdmin ? 'default' : 'outline'} className="capitalize">
            {userRole}
          </Badge>
        </div>
        <CardDescription>
          This component demonstrates how to use the PermissionsProvider
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">User Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge variant="outline" className="capitalize">
                        {role}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Admin:</span>
                      {admin ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          No
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Permissions:</span>
                      <Badge>{userPermissions.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Key Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manage Users</span>
                      {canManageUsers ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Edit Content</span>
                      {canEditContent ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">View Analytics</span>
                      {canViewAnalytics ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manage Settings</span>
                      {checkPermission('manage:settings') ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Permission Guard Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <PermissionGuard 
                    permission="manage:settings"
                    fallback={
                      <Button variant="outline" disabled className="w-full">
                        Settings (No Access)
                      </Button>
                    }
                  >
                    <Button variant="default" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Settings
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard 
                    permission={['create:post', 'edit:post']}
                    requireAll={true}
                    fallback={
                      <Button variant="outline" disabled className="w-full">
                        Content (Insufficient Permissions)
                      </Button>
                    }
                  >
                    <Button variant="default" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Content
                    </Button>
                  </PermissionGuard>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>The PermissionGuard component conditionally renders content based on user permissions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Create Posts</span>
                    {contentPermissions.canCreatePost ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Edit Posts</span>
                    {contentPermissions.canEditPost ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delete Posts</span>
                    {contentPermissions.canDeletePost ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Create Comments</span>
                    {contentPermissions.canCreateComment ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Edit Comments</span>
                    {contentPermissions.canEditComment ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delete Comments</span>
                    {contentPermissions.canDeleteComment ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Product Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Create Products</span>
                    {productPermissions.canCreateProduct ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Edit Products</span>
                    {productPermissions.canEditProduct ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delete Products</span>
                    {productPermissions.canDeleteProduct ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Manage Inventory</span>
                    {productPermissions.canManageInventory ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">View Orders</span>
                    {orderPermissions.canViewOrders ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Manage Orders</span>
                    {orderPermissions.canManageOrders ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Process Payments</span>
                    {orderPermissions.canProcessPayments ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Issue Refunds</span>
                    {orderPermissions.canIssueRefunds ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Using selector hooks for better performance: usePermissionChecks, useUserRole, useContentPermissions, etc.
        </p>
      </CardFooter>
    </Card>
  )
}
