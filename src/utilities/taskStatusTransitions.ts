import { TaskStatus } from '@/types/tasks'

/**
 * Defines valid status transitions for tasks
 * Each status can transition to specific other statuses based on business logic
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'completed'], // Can start work or mark as done directly
  in_progress: ['review', 'completed', 'todo'], // Can move to review, complete, or back to todo
  review: ['completed', 'in_progress', 'todo'], // Can approve, send back to work, or back to todo
  completed: ['review', 'in_progress'], // Can reopen for review or more work (but not back to todo directly)
}

/**
 * Validates if a status transition is allowed
 * @param fromStatus - Current task status
 * @param toStatus - Target task status
 * @returns boolean indicating if transition is valid
 */
export function isValidStatusTransition(fromStatus: TaskStatus, toStatus: TaskStatus): boolean {
  // Same status is always valid (no change)
  if (fromStatus === toStatus) {
    return true
  }

  // Check if the target status is in the allowed transitions
  return TASK_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false
}

/**
 * Gets all valid next statuses for a given current status
 * @param currentStatus - Current task status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(currentStatus: TaskStatus): TaskStatus[] {
  return TASK_STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * Gets a human-readable error message for invalid transitions
 * @param fromStatus - Current task status
 * @param toStatus - Target task status
 * @returns Error message string
 */
export function getTransitionErrorMessage(fromStatus: TaskStatus, toStatus: TaskStatus): string {
  const validTransitions = TASK_STATUS_TRANSITIONS[fromStatus] || []
  
  if (validTransitions.length === 0) {
    return `Tasks with status "${fromStatus}" cannot be changed to any other status.`
  }
  
  return `Cannot change task from "${fromStatus}" to "${toStatus}". Valid transitions are: ${validTransitions.join(', ')}.`
}

/**
 * Status progression order for UI display and logic
 */
export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed']

/**
 * Gets the next logical status in the workflow
 * @param currentStatus - Current task status
 * @returns Next status in the workflow, or null if at the end
 */
export function getNextWorkflowStatus(currentStatus: TaskStatus): TaskStatus | null {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) {
    return null
  }
  return STATUS_ORDER[currentIndex + 1]
}

/**
 * Gets the previous logical status in the workflow
 * @param currentStatus - Current task status
 * @returns Previous status in the workflow, or null if at the beginning
 */
export function getPreviousWorkflowStatus(currentStatus: TaskStatus): TaskStatus | null {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  if (currentIndex <= 0) {
    return null
  }
  return STATUS_ORDER[currentIndex - 1]
}

/**
 * Checks if a status represents a "completed" state
 * @param status - Task status to check
 * @returns boolean indicating if status is considered completed
 */
export function isCompletedStatus(status: TaskStatus): boolean {
  return status === 'completed'
}

/**
 * Checks if a status represents an "active" state (work in progress)
 * @param status - Task status to check
 * @returns boolean indicating if status is considered active
 */
export function isActiveStatus(status: TaskStatus): boolean {
  return status === 'in_progress' || status === 'review'
}

/**
 * Checks if a status represents a "pending" state (not started)
 * @param status - Task status to check
 * @returns boolean indicating if status is considered pending
 */
export function isPendingStatus(status: TaskStatus): boolean {
  return status === 'todo'
}

/**
 * Gets status color configuration for UI components
 * @param status - Task status
 * @returns Object with color classes for different UI elements
 */
export function getStatusColors(status: TaskStatus) {
  const colorMap = {
    todo: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    in_progress: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-600',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    review: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    },
    completed: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-300 dark:border-green-600',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
  }

  return colorMap[status]
}

/**
 * Validates a task status transition and returns result with error message if invalid
 * @param fromStatus - Current task status
 * @param toStatus - Target task status
 * @returns Object with isValid boolean and optional error message
 */
export function validateStatusTransition(fromStatus: TaskStatus, toStatus: TaskStatus): {
  isValid: boolean
  error?: string
} {
  if (isValidStatusTransition(fromStatus, toStatus)) {
    return { isValid: true }
  }

  return {
    isValid: false,
    error: getTransitionErrorMessage(fromStatus, toStatus)
  }
}
