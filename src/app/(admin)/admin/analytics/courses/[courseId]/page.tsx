'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CourseAnalytics from '@/components/admin/CourseAnalytics'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
interface CourseAnalyticsPageProps {
  params: {
    courseId: string
  }
}

export default function CourseAnalyticsPage({ params }: CourseAnalyticsPageProps) {
  const { courseId } = params

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Аналитика курса</h1>
        <Button asChild variant="outline">
          <Link href="/admin/analytics/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к списку курсов
          </Link>
        </Button>
      </div>

      <CourseAnalytics courseId={courseId} />
    </div>
  )
}
