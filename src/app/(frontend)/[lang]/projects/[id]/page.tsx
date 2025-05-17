import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import { getServerSession } from '@/utilities/getServerSession'
import ServiceProjectDashboardLayout from '@/components/ServiceProject/ServiceProjectDashboardLayout'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const session = await getServerSession()

  // Если пользователь не авторизован, редиректим на страницу входа
  if (!session?.user) {
    redirect('/login')
  }

  const payload = await getPayloadClient()

  // Проверяем, что это проект текущего пользователя или пользователь является администратором
  try {
    const project = await payload.findByID({
      collection: 'service-projects',
      id,
      depth: 2, // Загрузка связанных коллекций
    })

    // Проверка доступа: только владелец проекта или админ
    const isAdmin = session.user.roles?.includes('admin')
    const isOwner = project.customer?.id === session.user.id

    if (!isAdmin && !isOwner) {
      // Нет доступа, перенаправляем на главную страницу
      redirect('/projects')
    }

    // Получаем задачи проекта
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: {
        project: {
          equals: id,
        },
      },
      sort: '-createdAt',
    })

    // Получаем сообщения проекта
    const { docs: messages } = await payload.find({
      collection: 'project-messages',
      where: {
        project: {
          equals: id,
        },
      },
      sort: 'createdAt',
      depth: 1, // Загружаем авторов сообщений
    })

    const t = await getTranslations('ProjectDetails')

    return (
      <ServiceProjectDashboardLayout
        project={project}
        tasks={tasks}
        messages={messages}
        isAdmin={isAdmin}
      />
    )
  } catch (error) {
    console.error('Error fetching project:', error)
    return notFound()
  }
}
