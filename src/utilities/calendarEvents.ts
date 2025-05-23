import { formatDate } from './formatDate'

// Types for calendar events
export interface CalendarEvent {
  id: string
  date: Date
  type: 'milestone' | 'task' | 'project'
  eventType: 'start' | 'due' | 'completed' | 'created' | 'updated'
  title: string
  description?: string
  status: string
  priority?: string
  isPlanned: boolean
  isOverdue: boolean
  sourceId: string
  sourceType: 'milestone' | 'task' | 'project'
}

// Milestone interface based on the collection structure
interface Milestone {
  id: string
  title: string
  description?: string
  startDate?: string
  dueDate?: string
  completionDate?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

// Task interface based on the collection structure
interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  completionDate?: string
  status: 'new' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
}

// Project interface
interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  status: string
}

/**
 * Processes milestones and creates calendar events
 */
export function processMilestoneEvents(milestones: Milestone[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const now = new Date()

  milestones.forEach((milestone) => {
    // Start date event
    if (milestone.startDate) {
      const startDate = new Date(milestone.startDate)
      events.push({
        id: `milestone-start-${milestone.id}`,
        date: startDate,
        type: 'milestone',
        eventType: 'start',
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        priority: milestone.priority,
        isPlanned: true,
        isOverdue: false,
        sourceId: milestone.id,
        sourceType: 'milestone',
      })
    }

    // Due date event
    if (milestone.dueDate) {
      const dueDate = new Date(milestone.dueDate)
      const isOverdue = milestone.status !== 'completed' && dueDate < now
      
      events.push({
        id: `milestone-due-${milestone.id}`,
        date: dueDate,
        type: 'milestone',
        eventType: 'due',
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        priority: milestone.priority,
        isPlanned: true,
        isOverdue,
        sourceId: milestone.id,
        sourceType: 'milestone',
      })
    }

    // Completion date event
    if (milestone.completionDate) {
      const completionDate = new Date(milestone.completionDate)
      events.push({
        id: `milestone-completed-${milestone.id}`,
        date: completionDate,
        type: 'milestone',
        eventType: 'completed',
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        priority: milestone.priority,
        isPlanned: false,
        isOverdue: false,
        sourceId: milestone.id,
        sourceType: 'milestone',
      })
    }
  })

  return events
}

/**
 * Processes tasks and creates calendar events
 */
export function processTaskEvents(tasks: Task[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const now = new Date()

  tasks.forEach((task) => {
    // Due date event
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const isOverdue = task.status !== 'completed' && dueDate < now
      
      events.push({
        id: `task-due-${task.id}`,
        date: dueDate,
        type: 'task',
        eventType: 'due',
        title: task.title,
        description: task.description,
        status: task.status,
        isPlanned: true,
        isOverdue,
        sourceId: task.id,
        sourceType: 'task',
      })
    }

    // Completion date event
    if (task.completionDate) {
      const completionDate = new Date(task.completionDate)
      events.push({
        id: `task-completed-${task.id}`,
        date: completionDate,
        type: 'task',
        eventType: 'completed',
        title: task.title,
        description: task.description,
        status: task.status,
        isPlanned: false,
        isOverdue: false,
        sourceId: task.id,
        sourceType: 'task',
      })
    }
  })

  return events
}

/**
 * Processes project events
 */
export function processProjectEvents(project: Project): CalendarEvent[] {
  const events: CalendarEvent[] = []

  // Project creation event
  const createdDate = new Date(project.createdAt)
  events.push({
    id: `project-created-${project.id}`,
    date: createdDate,
    type: 'project',
    eventType: 'created',
    title: project.name,
    status: project.status,
    isPlanned: false,
    isOverdue: false,
    sourceId: project.id,
    sourceType: 'project',
  })

  return events
}

/**
 * Groups events by date for calendar display
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groupedEvents = new Map<string, CalendarEvent[]>()

  events.forEach((event) => {
    const dateKey = event.date.toISOString().split('T')[0] // YYYY-MM-DD format
    
    if (!groupedEvents.has(dateKey)) {
      groupedEvents.set(dateKey, [])
    }
    
    groupedEvents.get(dateKey)!.push(event)
  })

  return groupedEvents
}

/**
 * Gets all events for a specific date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateKey = date.toISOString().split('T')[0]
  const groupedEvents = groupEventsByDate(events)
  return groupedEvents.get(dateKey) || []
}

/**
 * Checks if a date has any events
 */
export function hasEventsOnDate(events: CalendarEvent[], date: Date): boolean {
  return getEventsForDate(events, date).length > 0
}

/**
 * Gets the CSS classes for event styling based on event properties
 */
export function getEventStyleClasses(event: CalendarEvent): string {
  const baseClasses = 'text-xs px-1 py-0.5 rounded-sm truncate'
  
  if (event.isOverdue) {
    return `${baseClasses} bg-red-100 text-red-800 border border-red-200`
  }
  
  if (!event.isPlanned) {
    // Actual/completed events
    if (event.type === 'milestone') {
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
    } else if (event.type === 'task') {
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`
    }
  } else {
    // Planned events
    if (event.type === 'milestone') {
      return `${baseClasses} bg-purple-50 text-purple-700 border border-purple-200 border-dashed`
    } else if (event.type === 'task') {
      return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200 border-dashed`
    }
  }
  
  return `${baseClasses} bg-gray-100 text-gray-600`
}

/**
 * Formats event tooltip content
 */
export function formatEventTooltip(
  event: CalendarEvent,
  t: (key: string, params?: any) => string,
  locale: string
): string {
  const parts: string[] = []
  
  // Event title
  const titleKey = event.type === 'milestone' ? 'calendarTab.tooltip.milestone' : 'calendarTab.tooltip.task'
  parts.push(t(titleKey, { title: event.title }))
  
  // Status
  parts.push(t('calendarTab.tooltip.status', { status: event.status }))
  
  // Priority (for milestones)
  if (event.priority) {
    parts.push(t('calendarTab.tooltip.priority', { priority: event.priority }))
  }
  
  // Date information
  const formattedDate = formatDate(event.date.toISOString(), locale)
  if (event.eventType === 'due') {
    parts.push(t('calendarTab.tooltip.dueDate', { date: formattedDate }))
  } else if (event.eventType === 'completed') {
    parts.push(t('calendarTab.tooltip.completionDate', { date: formattedDate }))
  } else if (event.eventType === 'start') {
    parts.push(t('calendarTab.tooltip.startDate', { date: formattedDate }))
  }
  
  return parts.join('\n')
}
