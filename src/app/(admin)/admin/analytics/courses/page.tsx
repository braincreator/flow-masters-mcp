'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CourseAnalytics from '@/components/admin/CourseAnalytics'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CoursesAnalyticsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Аналитика курсов</h1>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться в панель управления
          </Link>
        </Button>
      </div>
      
      <CourseAnalytics />
    </div>
  )
}
