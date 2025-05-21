import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getAuth } from '../../../helpers/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { approved, feedback, satisfactionRating } = body

    // Получаем этап проекта
    const milestone = await payload.findByID({
      collection: 'project-milestones',
      id,
      depth: 1,
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    // Получаем проект
    const projectId = typeof milestone.project === 'object' ? milestone.project.id : milestone.project
    const project = await payload.findByID({
      collection: 'service-projects',
      id: projectId,
    })

    // Проверяем, является ли пользователь заказчиком проекта
    const customerId = typeof project.customer === 'object' ? project.customer.id : project.customer
    if (customerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Проверяем, требуется ли подтверждение клиента и завершен ли этап
    if (!milestone.clientApprovalRequired || milestone.status !== 'completed') {
      return NextResponse.json(
        { error: 'This milestone does not require approval or is not completed' },
        { status: 400 }
      )
    }

    // Обновляем этап
    const updatedMilestone = await payload.update({
      collection: 'project-milestones',
      id,
      data: {
        clientApproved: approved,
        clientFeedback: feedback || undefined,
        satisfactionRating: satisfactionRating || undefined,
      },
    })

    // Если есть оценка удовлетворенности, создаем запись в коллекции project-feedback
    if (approved && satisfactionRating) {
      await payload.create({
        collection: 'project-feedback',
        data: {
          project: projectId,
          milestone: id,
          feedbackType: 'milestone',
          rating: satisfactionRating,
          comment: feedback || undefined,
          submittedBy: user.id,
        },
      })
    }

    // Создаем системное сообщение
    const messageContent = approved
      ? `Milestone "${milestone.title}" has been approved by the client.`
      : `Client has provided feedback for milestone "${milestone.title}".`

    await payload.create({
      collection: 'project-messages',
      data: {
        project: projectId,
        author: user.id,
        isSystemMessage: true,
        content: messageContent,
      },
    })

    // Отправляем уведомление исполнителю проекта, если он назначен
    if (project.assignedTo) {
      const assignedToId = typeof project.assignedTo === 'object' ? project.assignedTo.id : project.assignedTo

      // Получаем сервис уведомлений
      const serviceRegistry = req.payload.services.get('service-registry')
      const notificationService = serviceRegistry.getNotificationService()

      if (notificationService) {
        await notificationService.sendNotification({
          userId: assignedToId,
          title: approved ? 'Milestone Approved' : 'Milestone Feedback Received',
          messageKey: approved ? 'NotificationBodies.milestone_approved' : 'NotificationBodies.milestone_feedback',
          messageParams: {
            milestoneName: milestone.title,
            projectName: project.name,
          },
          type: 'project_status_updated',
          link: `/dashboard/projects/${projectId}`,
          metadata: {
            projectId,
            milestoneId: id,
            approved,
          },
        })
      }
    }

    return NextResponse.json(updatedMilestone)
  } catch (error) {
    console.error('Error approving milestone:', error)
    return NextResponse.json({ error: 'Failed to approve milestone' }, { status: 500 })
  }
}
