'use client'

import React, { createContext, useContext, useMemo, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

export type Permission = 
  // Content permissions
  | 'create:post' 
  | 'edit:post' 
  | 'delete:post'
  | 'create:comment'
  | 'edit:comment'
  | 'delete:comment'
  // User permissions
  | 'view:users'
  | 'create:user'
  | 'edit:user'
  | 'delete:user'
  // Admin permissions
  | 'manage:settings'
  | 'view:analytics'
  | 'manage:roles'
  // Product permissions
  | 'create:product'
  | 'edit:product'
  | 'delete:product'
  | 'manage:inventory'
  // Order permissions
  | 'view:orders'
  | 'manage:orders'
  | 'process:payments'
  | 'issue:refunds'

export type Role = 'admin' | 'editor' | 'author' | 'customer' | 'guest'

interface RolePermissions {
  [role: string]: Permission[]
}

interface PermissionsContextType {
  // Permission checks
  hasPermission: (permission: Permission) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  
  // Role information
  userRole: Role | undefined
  userPermissions: Permission[]
  isAdmin: boolean
  
  // Component helpers
  PermissionGuard: React.FC<{
    permission: Permission | Permission[]
    requireAll?: boolean
    fallback?: React.ReactNode
    children: React.ReactNode
  }>
}

// Define role-based permissions
const rolePermissions: RolePermissions = {
  admin: [
    'create:post', 'edit:post', 'delete:post',
    'create:comment', 'edit:comment', 'delete:comment',
    'view:users', 'create:user', 'edit:user', 'delete:user',
    'manage:settings', 'view:analytics', 'manage:roles',
    'create:product', 'edit:product', 'delete:product', 'manage:inventory',
    'view:orders', 'manage:orders', 'process:payments', 'issue:refunds'
  ],
  editor: [
    'create:post', 'edit:post', 'delete:post',
    'create:comment', 'edit:comment', 'delete:comment',
    'view:users',
    'view:analytics',
    'create:product', 'edit:product', 'delete:product',
    'view:orders'
  ],
  author: [
    'create:post', 'edit:post',
    'create:comment', 'edit:comment',
    'view:orders'
  ],
  customer: [
    'create:comment', 'edit:comment',
  ],
  guest: []
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  // Get user role, defaulting to guest if not authenticated
  const userRole = (user?.role as Role) || 'guest'
  
  // Get permissions for the user's role
  const userPermissions = useMemo(() => {
    return rolePermissions[userRole] || []
  }, [userRole])
  
  // Check if user has a specific permission
  const hasPermission = useMemo(() => (permission: Permission) => {
    return userPermissions.includes(permission)
  }, [userPermissions])
  
  // Check if user has all of the specified permissions
  const hasAllPermissions = useMemo(() => (permissions: Permission[]) => {
    return permissions.every(permission => userPermissions.includes(permission))
  }, [userPermissions])
  
  // Check if user has any of the specified permissions
  const hasAnyPermission = useMemo(() => (permissions: Permission[]) => {
    return permissions.some(permission => userPermissions.includes(permission))
  }, [userPermissions])
  
  // Check if user is an admin
  const isAdmin = useMemo(() => userRole === 'admin', [userRole])
  
  // Permission guard component
  const PermissionGuard = useMemo(() => {
    return function PermissionGuard({
      permission,
      requireAll = true,
      fallback = null,
      children
    }: {
      permission: Permission | Permission[]
      requireAll?: boolean
      fallback?: React.ReactNode
      children: React.ReactNode
    }) {
      const permissions = Array.isArray(permission) ? permission : [permission]
      const hasAccess = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions)
      
      return hasAccess ? <>{children}</> : <>{fallback}</>
    }
  }, [hasAllPermissions, hasAnyPermission])
  
  // Memoize context value
  const value = useMemo(() => ({
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    userRole,
    userPermissions,
    isAdmin,
    PermissionGuard
  }), [
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    userRole,
    userPermissions,
    isAdmin,
    PermissionGuard
  ])
  
  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
