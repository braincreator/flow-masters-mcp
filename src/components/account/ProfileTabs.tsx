'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const t = useTranslations('Account.Profile')
  
  const tabs = [
    { id: 'personal', label: t('tabs.personal') },
    { id: 'security', label: t('tabs.security') },
    { id: 'notifications', label: t('tabs.notifications') },
    { id: 'achievements', label: t('tabs.achievements') },
  ]

  return (
    <div className="flex flex-wrap mb-8 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px",
            activeTab === tab.id
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}