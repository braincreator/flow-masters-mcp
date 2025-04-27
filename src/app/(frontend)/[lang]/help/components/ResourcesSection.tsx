'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BookOpen, Newspaper, Users } from 'lucide-react'
import Link from 'next/link'

interface ResourcesSectionProps {
  locale: string
}

export function ResourcesSection({ locale }: ResourcesSectionProps) {
  const t = useTranslations('Help.resources')

  const resources = [
    {
      title: t('documentation'),
      icon: <FileText className="h-6 w-6" />,
      href: `/${locale}/documentation`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: t('tutorials'),
      icon: <BookOpen className="h-6 w-6" />,
      href: `/${locale}/tutorials`,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: t('blog'),
      icon: <Newspaper className="h-6 w-6" />,
      href: `/${locale}/blog`,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: t('community'),
      icon: <Users className="h-6 w-6" />,
      href: `/${locale}/community`,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Explore our learning resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {resources.map((resource, index) => (
            <Link
              key={index}
              href={resource.href}
              className="flex flex-col items-center p-6 rounded-lg border hover:border-primary transition-all hover:shadow-sm"
            >
              <div className={`p-3 rounded-full ${resource.color} mb-4`}>{resource.icon}</div>
              <h3 className="font-medium">{resource.title}</h3>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
