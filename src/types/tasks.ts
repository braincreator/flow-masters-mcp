export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TaskAssignee {
  id: string
  name?: string
  email: string
  avatar?: string
}

export interface TaskComment {
  id: string
  content: string
  author: TaskAssignee
  createdAt: string
  updatedAt: string
}

export interface TaskAttachment {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  uploadedBy: TaskAssignee
  uploadedAt: string
}

export interface TaskActivity {
  id: string
  type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'comment_added' | 'file_attached'
  description: string
  author: TaskAssignee
  createdAt: string
  metadata?: Record<string, any>
}

export interface TaskItem {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  progress: number // 0-100
  createdAt: string
  updatedAt: string
  dueDate?: string
  completedAt?: string
  assignedTo?: TaskAssignee
  assignedBy?: TaskAssignee
  projectId: string
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  activities?: TaskActivity[]
  dependencies?: string[] // Task IDs that this task depends on
  subtasks?: TaskItem[]
}

export interface KanbanColumn {
  id: TaskStatus
  title: string
  color: string
  limit?: number
  tasks: TaskItem[]
}

export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignedTo?: string
  tags?: string[]
  estimatedHours?: number
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string[]
  tags?: string[]
  dueDateRange?: {
    start?: string
    end?: string
  }
  search?: string
}

export interface TaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  overdue: number
  completedThisWeek: number
  averageCompletionTime: number
}

// API Response types
export interface TasksResponse {
  tasks: TaskItem[]
  stats: TaskStats
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateTaskRequest {
  projectId: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  assignedTo?: string
  tags?: string[]
  estimatedHours?: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  progress?: number
  dueDate?: string
  assignedTo?: string
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
}

export interface TaskDragResult {
  taskId: string
  sourceStatus: TaskStatus
  destinationStatus: TaskStatus
  sourceIndex: number
  destinationIndex: number
}
