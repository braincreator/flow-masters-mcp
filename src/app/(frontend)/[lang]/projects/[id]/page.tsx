import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/utilities/getServerSession'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const session = await getServerSession()

  // Если пользователь не авторизован, редиректим на страницу входа
  if (!session?.user) {
    redirect('/login')
  }

  // Редирект на новый путь в dashboard
  redirect(`/${lang}/dashboard/projects/${id}`)
}
