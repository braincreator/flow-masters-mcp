import React from 'react'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import { getServerSession } from '@/utilities/getServerSession'
import ServiceProjectList from '@/components/ServiceProject/ServiceProjectList'

export default async function ProjectListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession()

  // Если пользователь не авторизован, редиректим на страницу входа
  if (!session?.user) {
    redirect('/login')
  }

  const payload = await getPayloadClient()

  // Получаем проекты текущего пользователя
  const { docs: projects, totalDocs } = await payload.find({
    collection: 'service-projects',
    where: {
      customer: {
        equals: session.user.id,
      },
    },
    sort: '-createdAt', // Сортировка по дате создания (новые вверху)
    depth: 1, // Загрузить связанные коллекции
  })

  const t = await getTranslations('Projects')

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('myProjects')}</h1>

      {totalDocs > 0 ? (
        <ServiceProjectList projects={projects} />
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('noProjects')}</h2>
          <p className="text-gray-600 mb-6">{t('noProjectsDescription')}</p>
        </div>
      )}
    </div>
  )
}
