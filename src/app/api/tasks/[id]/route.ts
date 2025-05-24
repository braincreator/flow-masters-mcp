import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getAuth } from '../../helpers/auth'
import config from '@/payload.config'
import { TaskItem, TaskStatus, TaskPriority } from '@/types/tasks'

let cachedPayload = null

async function getPayloadInstance() {
  if (cachedPayload) {
    return cachedPayload
  }
  cachedPayload = await getPayload({ config })
  return cachedPayload
}

// Update task
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const updates = await req.json()

    const payload = await getPayloadInstance()

    // First, check if the task exists and user has access
    const taskResponse = await payload.find({
      collection: 'tasks',
      where: { id: { equals: taskId } },
      depth: 2,
    })

    if (taskResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = taskResponse.docs[0]

    // Check if user has access to the project
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: { equals: task.project },
        or: [{ 'customer.id': { equals: user.id } }, { 'assignedTo.id': { equals: user.id } }],
      },
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (updates.title !== undefined) updateData.name = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.progress !== undefined) updateData.progress = updates.progress
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
    if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo
    if (updates.estimatedHours !== undefined) updateData.estimatedHours = updates.estimatedHours
    if (updates.actualHours !== undefined) updateData.actualHours = updates.actualHours

    // If status is being changed to completed, set completedAt
    if (updates.status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date().toISOString()
      updateData.progress = 100
    }

    // Update the task
    const updatedTask = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: updateData,
    })

    // Transform to match our interface
    const taskItem: TaskItem = {
      id: updatedTask.id,
      title: updatedTask.name,
      description: updatedTask.description || '',
      status: updatedTask.status as TaskStatus,
      priority: (updatedTask.priority as TaskPriority) || 'medium',
      progress: updatedTask.progress || 0,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
      dueDate: updatedTask.dueDate,
      completedAt: updatedTask.completedAt,
      projectId: task.project,
      assignedTo: updatedTask.assignedTo ? {
        id: updatedTask.assignedTo.id,
        name: updatedTask.assignedTo.name,
        email: updatedTask.assignedTo.email,
      } : undefined,
      tags: updatedTask.tags?.map((t: any) => t.tag) || [],
      estimatedHours: updatedTask.estimatedHours || 0,
      actualHours: updatedTask.actualHours || 0,
      comments: updatedTask.comments || [],
      attachments: updatedTask.attachments || [],
      activities: updatedTask.activities || [],
    }

    return NextResponse.json(taskItem)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// Delete task
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const payload = await getPayloadInstance()

    // First, check if the task exists and user has access
    const taskResponse = await payload.find({
      collection: 'tasks',
      where: { id: { equals: taskId } },
      depth: 2,
    })

    if (taskResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = taskResponse.docs[0]

    // Check if user has access to the project
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: { equals: task.project },
        or: [{ 'customer.id': { equals: user.id } }, { 'assignedTo.id': { equals: user.id } }],
      },
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the task
    await payload.delete({
      collection: 'tasks',
      id: taskId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

// Get single task
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const payload = await getPayloadInstance()

    // Get the task
    const taskResponse = await payload.find({
      collection: 'tasks',
      where: { id: { equals: taskId } },
      depth: 2,
    })

    if (taskResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = taskResponse.docs[0]

    // Check if user has access to the project
    const projectResponse = await payload.find({
      collection: 'service-projects',
      where: {
        id: { equals: task.project },
        or: [{ 'customer.id': { equals: user.id } }, { 'assignedTo.id': { equals: user.id } }],
      },
    })

    if (projectResponse.totalDocs === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Transform to match our interface
    const taskItem: TaskItem = {
      id: task.id,
      title: task.name,
      description: task.description || '',
      status: task.status as TaskStatus,
      priority: (task.priority as TaskPriority) || 'medium',
      progress: task.progress || 0,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      projectId: task.project,
      assignedTo: task.assignedTo ? {
        id: task.assignedTo.id,
        name: task.assignedTo.name,
        email: task.assignedTo.email,
      } : undefined,
      tags: task.tags?.map((t: any) => t.tag) || [],
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      comments: task.comments || [],
      attachments: task.attachments || [],
      activities: task.activities || [],
    }

    return NextResponse.json(taskItem)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}
