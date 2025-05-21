import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/utilities/getServerSession'

export default async function ProjectListPage({
  params,
}: {
  params: { lang: string }
}) {
  const session = await getServerSession()

  // Если пользователь не авторизован, редиректим на страницу входа
  if (!session?.user) {
    redirect('/login')
  }

  // Редирект на новый путь в dashboard
  redirect(`/${params.lang}/dashboard/projects`)
}
