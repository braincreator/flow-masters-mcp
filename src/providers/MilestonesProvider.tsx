'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'

// Types
export interface MilestoneItem {
  id: string
  title: string
  description?: string
  status: 'new' | 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'delayed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate?: string
  dueDate?: string
  completionDate?: string
  progress: number
  order: number
  dependencies?: string[]
  associatedTasks?: Array<{
    id: string
    title: string
    status: string
  }>
  createdAt: string
  updatedAt: string
}

export interface MilestoneFormData {
  title: string
  description?: string
  startDate?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dependencies?: string[]
}

interface MilestonesContextType {
  milestones: MilestoneItem[]
  isLoading: boolean
  error: string | null

  // CRUD operations
  createMilestone: (projectId: string, data: MilestoneFormData) => Promise<void>
  updateMilestone: (milestoneId: string, data: Partial<MilestoneFormData>) => Promise<void>
  deleteMilestone: (milestoneId: string) => Promise<void>

  // Status operations
  updateMilestoneStatus: (milestoneId: string, status: MilestoneItem['status']) => Promise<void>
  updateMilestoneProgress: (milestoneId: string, progress: number) => Promise<void>

  // Ordering operations
  reorderMilestones: (milestoneIds: string[]) => Promise<void>
  moveMilestone: (milestoneId: string, direction: 'up' | 'down') => Promise<void>

  // Utility functions
  fetchMilestones: (projectId: string) => Promise<void>
  refreshMilestones: () => Promise<void>
  getMilestoneById: (milestoneId: string) => MilestoneItem | undefined
  validateDependencies: (milestoneId: string, dependencies: string[]) => boolean

  // Filtering and sorting
  filteredMilestones: MilestoneItem[]
  setFilter: (filter: string) => void
  setSorting: (sorting: string) => void
  currentFilter: string
  currentSorting: string
}

const MilestonesContext = createContext<MilestonesContextType | undefined>(undefined)

interface MilestonesProviderProps {
  children: React.ReactNode
  projectId?: string
}

export function MilestonesProvider({ children, projectId }: MilestonesProviderProps) {
  const { user } = useAuth()
  const t = useTranslations('ProjectDetails.milestonesTab')

  // State
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentSorting, setCurrentSorting] = useState('byOrder')

  // Fetch milestones from API
  const fetchMilestones = useCallback(
    async (projectId: string) => {
      if (!user || !projectId) return

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/project-milestones?projectId=${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch milestones')
        }

        const data = await response.json()
        setMilestones(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        toast({
          title: t('notifications.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [user, t],
  )

  // Create milestone
  const createMilestone = useCallback(
    async (projectId: string, data: MilestoneFormData) => {
      if (!user) return

      try {
        setIsLoading(true)

        // Optimistic update
        const tempId = `temp-${Date.now()}`
        const newMilestone: MilestoneItem = {
          id: tempId,
          ...data,
          status: 'not_started',
          progress: 0,
          order: milestones.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setMilestones((prev) => [...prev, newMilestone])

        const response = await fetch('/api/project-milestones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            project: projectId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create milestone')
        }

        const createdMilestone = await response.json()

        // Replace temp milestone with real one
        setMilestones((prev) => prev.map((m) => (m.id === tempId ? createdMilestone : m)))

        toast({
          title: t('notifications.created'),
          description: data.title,
        })
      } catch (err) {
        // Revert optimistic update
        setMilestones((prev) => prev.filter((m) => !m.id.startsWith('temp-')))

        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        toast({
          title: t('notifications.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [user, milestones.length, t],
  )

  // Update milestone
  const updateMilestone = useCallback(
    async (milestoneId: string, data: Partial<MilestoneFormData>) => {
      if (!user) return

      try {
        // Optimistic update
        setMilestones((prev) =>
          prev.map((m) =>
            m.id === milestoneId ? { ...m, ...data, updatedAt: new Date().toISOString() } : m,
          ),
        )

        const response = await fetch(`/api/project-milestones/${milestoneId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update milestone')
        }

        const updatedMilestone = await response.json()

        setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updatedMilestone : m)))

        toast({
          title: t('notifications.updated'),
          description: updatedMilestone.title,
        })
      } catch (err) {
        // Revert optimistic update
        await fetchMilestones(projectId || '')

        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        toast({
          title: t('notifications.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      }
    },
    [user, fetchMilestones, projectId, t],
  )

  // Delete milestone
  const deleteMilestone = useCallback(
    async (milestoneId: string) => {
      if (!user) return

      try {
        // Optimistic update
        const milestoneToDelete = milestones.find((m) => m.id === milestoneId)
        setMilestones((prev) => prev.filter((m) => m.id !== milestoneId))

        const response = await fetch(`/api/project-milestones/${milestoneId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete milestone')
        }

        toast({
          title: t('notifications.deleted'),
          description: milestoneToDelete?.title,
        })
      } catch (err) {
        // Revert optimistic update
        await fetchMilestones(projectId || '')

        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        toast({
          title: t('notifications.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      }
    },
    [user, milestones, fetchMilestones, projectId, t],
  )

  // Update milestone status
  const updateMilestoneStatus = useCallback(
    async (milestoneId: string, status: MilestoneItem['status']) => {
      await updateMilestone(milestoneId, {
        status,
        ...(status === 'completed' ? { completionDate: new Date().toISOString() } : {}),
      })

      toast({
        title: t('notifications.statusChanged'),
        description: t(`status.${status}`),
      })
    },
    [updateMilestone, t],
  )

  // Update milestone progress
  const updateMilestoneProgress = useCallback(
    async (milestoneId: string, progress: number) => {
      await updateMilestone(milestoneId, { progress })
    },
    [updateMilestone],
  )

  // Reorder milestones
  const reorderMilestones = useCallback(
    async (milestoneIds: string[]) => {
      if (!user) return

      try {
        // Optimistic update
        const reorderedMilestones = milestoneIds
          .map((id, index) => {
            const milestone = milestones.find((m) => m.id === id)
            return milestone ? { ...milestone, order: index } : null
          })
          .filter(Boolean) as MilestoneItem[]

        setMilestones(reorderedMilestones)

        const response = await fetch('/api/project-milestones/reorder', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ milestoneIds }),
        })

        if (!response.ok) {
          throw new Error('Failed to reorder milestones')
        }

        toast({
          title: t('notifications.reordered'),
        })
      } catch (err) {
        // Revert optimistic update
        await fetchMilestones(projectId || '')

        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        toast({
          title: t('notifications.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      }
    },
    [user, milestones, fetchMilestones, projectId, t],
  )

  // Move milestone up or down
  const moveMilestone = useCallback(
    async (milestoneId: string, direction: 'up' | 'down') => {
      const currentIndex = milestones.findIndex((m) => m.id === milestoneId)
      if (currentIndex === -1) return

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= milestones.length) return

      const newOrder = [...milestones]
      const [movedItem] = newOrder.splice(currentIndex, 1)
      newOrder.splice(newIndex, 0, movedItem)

      await reorderMilestones(newOrder.map((m) => m.id))
    },
    [milestones, reorderMilestones],
  )

  // Refresh milestones
  const refreshMilestones = useCallback(async () => {
    if (projectId) {
      await fetchMilestones(projectId)
    }
  }, [fetchMilestones, projectId])

  // Get milestone by ID
  const getMilestoneById = useCallback(
    (milestoneId: string) => {
      return milestones.find((m) => m.id === milestoneId)
    },
    [milestones],
  )

  // Validate dependencies (check for circular dependencies)
  const validateDependencies = useCallback(
    (milestoneId: string, dependencies: string[]): boolean => {
      // Simple circular dependency check
      const checkCircular = (id: string, deps: string[], visited: Set<string>): boolean => {
        if (visited.has(id)) return true
        visited.add(id)

        const milestone = milestones.find((m) => m.id === id)
        if (!milestone?.dependencies) return false

        return milestone.dependencies.some((depId) => checkCircular(depId, deps, new Set(visited)))
      }

      return !dependencies.some((depId) => checkCircular(depId, dependencies, new Set()))
    },
    [milestones],
  )

  // Filter milestones
  const filteredMilestones = React.useMemo(() => {
    let filtered = [...milestones]

    // Apply filters
    switch (currentFilter) {
      case 'active':
        filtered = filtered.filter((m) => m.status === 'in_progress' || m.status === 'not_started')
        break
      case 'completed':
        filtered = filtered.filter((m) => m.status === 'completed')
        break
      case 'overdue':
        filtered = filtered.filter((m) => m.status === 'overdue')
        break
      default:
        // 'all' - no filtering
        break
    }

    // Apply sorting
    switch (currentSorting) {
      case 'byDueDate':
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
        break
      case 'byPriority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        break
      case 'byProgress':
        filtered.sort((a, b) => b.progress - a.progress)
        break
      case 'byCreated':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        // 'byOrder' - sort by order field
        filtered.sort((a, b) => a.order - b.order)
        break
    }

    return filtered
  }, [milestones, currentFilter, currentSorting])

  // Set filter
  const setFilter = useCallback((filter: string) => {
    setCurrentFilter(filter)
  }, [])

  // Set sorting
  const setSorting = useCallback((sorting: string) => {
    setCurrentSorting(sorting)
  }, [])

  // Auto-fetch milestones when projectId changes
  useEffect(() => {
    if (projectId && user) {
      fetchMilestones(projectId)
    }
  }, [projectId, user, fetchMilestones])

  const value: MilestonesContextType = {
    milestones,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
    updateMilestoneProgress,
    reorderMilestones,
    moveMilestone,
    fetchMilestones,
    refreshMilestones,
    getMilestoneById,
    validateDependencies,
    filteredMilestones,
    setFilter,
    setSorting,
    currentFilter,
    currentSorting,
  }

  return <MilestonesContext.Provider value={value}>{children}</MilestonesContext.Provider>
}

export function useMilestones() {
  const context = useContext(MilestonesContext)
  if (context === undefined) {
    throw new Error('useMilestones must be used within a MilestonesProvider')
  }
  return context
}
