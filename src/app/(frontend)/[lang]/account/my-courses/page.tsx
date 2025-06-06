import React from 'react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { PageHeading } from '@/components/PageHeading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const MyCoursesPage = async () => {
  const t = await getTranslations('Account.MyCourses')
  
  // For now, show authentication required message
  // In a real app, you would check authentication here and fetch user's courses
  
  return (
    <div className="container mx-auto py-8">
      <PageHeading title={t('title')} description={t('description')} />

      <Alert className="mt-6">
        <AlertTitle>{t('accessDeniedTitle')}</AlertTitle>
        <AlertDescription>{t('authenticationRequiredMessage')}</AlertDescription>
        <Link href="/login" className="mt-2 inline-block font-medium text-blue-600 hover:underline">
          {t('loginLink')}
        </Link>
      </Alert>
    </div>
  )
}

export default MyCoursesPage
