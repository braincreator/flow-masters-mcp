'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Award,
  Gift,
  Settings,
  HelpCircle,
  Calendar,
  MessageSquare,
  FileText,
  LogOut,
} from 'lucide-react'

interface QuickActionsProps {
  locale: string
  onLogout: () => void
}

export function QuickActions({ locale, onLogout }: QuickActionsProps) {
  const t = useTranslations('QuickActions')

  const actions = [
    {
      id: 'continue-learning',
      icon: <BookOpen className="w-5 h-5" />,
      label: t('continueLearning'),
      href: `/${locale}/courses/continue`,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    },
    {
      id: 'achievements',
      icon: <Award className="w-5 h-5" />,
      label: t('viewAchievements'),
      href: `/${locale}/achievements`,
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    },
    {
      id: 'rewards',
      icon: <Gift className="w-5 h-5" />,
      label: t('claimRewards'),
      href: `/${locale}/rewards`,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    },
    {
      id: 'schedule',
      icon: <Calendar className="w-5 h-5" />,
      label: t('schedule'),
      href: `/${locale}/calendar`,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    },
    {
      id: 'support',
      icon: <MessageSquare className="w-5 h-5" />,
      label: t('support'),
      href: `/${locale}/support`,
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    },
    {
      id: 'certificates',
      icon: <FileText className="w-5 h-5" />,
      label: t('certificates'),
      href: `/${locale}/certificates`,
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
    },
    {
      id: 'settings',
      icon: <Settings className="w-5 h-5" />,
      label: t('settings'),
      href: `/${locale}/settings`,
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    {
      id: 'help',
      icon: <HelpCircle className="w-5 h-5" />,
      label: t('help'),
      href: `/${locale}/help`,
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {action.id === 'logout' ? (
                <button
                  onClick={onLogout}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} w-full h-full transition-all duration-200 hover:scale-105`}
                >
                  {action.icon}
                  <span className="mt-2 text-xs font-medium text-center">{action.label}</span>
                </button>
              ) : (
                <Link
                  href={action.href}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg ${action.color} w-full h-full transition-all duration-200 hover:scale-105`}
                >
                  {action.icon}
                  <span className="mt-2 text-xs font-medium text-center">{action.label}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
