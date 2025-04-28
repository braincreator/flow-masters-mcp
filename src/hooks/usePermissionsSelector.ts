'use client'

import { useContext } from 'react'
import { PermissionsContext, PermissionsContextType } from '@/providers/PermissionsProvider'
import type { Permission, Role } from '@/providers/PermissionsProvider'

/**
 * Custom hook to select specific parts of the permissions context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the permissions context
 * @returns The selected parts of the permissions context
 */
export function usePermissionsSelector<T>(selector: (context: PermissionsContextType) => T): T {
  const context = useContext(PermissionsContext)

  if (context === undefined) {
    throw new Error('usePermissionsSelector must be used within a PermissionsProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the permission check methods
 */
export function usePermissionChecks() {
  return usePermissionsSelector((context) => ({
    hasPermission: context.hasPermission,
    hasAllPermissions: context.hasAllPermissions,
    hasAnyPermission: context.hasAnyPermission,
  }))
}

/**
 * Select only the user role information
 */
export function useUserRole() {
  return usePermissionsSelector((context) => ({
    userRole: context.userRole,
    userPermissions: context.userPermissions,
    isAdmin: context.isAdmin,
  }))
}

/**
 * Select only the PermissionGuard component
 */
export function usePermissionGuard() {
  return usePermissionsSelector((context) => ({
    PermissionGuard: context.PermissionGuard,
  }))
}

/**
 * Check if the user has permission to manage content
 */
export function useContentPermissions() {
  return usePermissionsSelector((context) => ({
    canCreatePost: context.hasPermission('create:post'),
    canEditPost: context.hasPermission('edit:post'),
    canDeletePost: context.hasPermission('delete:post'),
    canCreateComment: context.hasPermission('create:comment'),
    canEditComment: context.hasPermission('edit:comment'),
    canDeleteComment: context.hasPermission('delete:comment'),
  }))
}

/**
 * Check if the user has permission to manage products
 */
export function useProductPermissions() {
  return usePermissionsSelector((context) => ({
    canCreateProduct: context.hasPermission('create:product'),
    canEditProduct: context.hasPermission('edit:product'),
    canDeleteProduct: context.hasPermission('delete:product'),
    canManageInventory: context.hasPermission('manage:inventory'),
  }))
}

/**
 * Check if the user has permission to manage orders
 */
export function useOrderPermissions() {
  return usePermissionsSelector((context) => ({
    canViewOrders: context.hasPermission('view:orders'),
    canManageOrders: context.hasPermission('manage:orders'),
    canProcessPayments: context.hasPermission('process:payments'),
    canIssueRefunds: context.hasPermission('issue:refunds'),
  }))
}

/**
 * Check if the user has admin permissions
 */
export function useAdminPermissions() {
  return usePermissionsSelector((context) => ({
    canManageSettings: context.hasPermission('manage:settings'),
    canViewAnalytics: context.hasPermission('view:analytics'),
    canManageRoles: context.hasPermission('manage:roles'),
    isAdmin: context.isAdmin,
  }))
}
