'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ProfileCard } from '@/components/account/ProfileCard'
import { ProfileTabs } from '@/components/account/ProfileTabs'
import { PersonalInfoTab } from '@/components/account/tabs/PersonalInfoTab'
import { SecurityTab } from '@/components/account/tabs/SecurityTab'
import { NotificationsTab } from '@/components/account/tabs/NotificationsTab'
import { AchievementsTab } from '@/components/account/tabs/AchievementsTab'
import { useAuth } from '@/hooks/useAuth'
import { PageHeading } from '@/components/PageHeading'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Extended User type that includes all the properties we need
interface ExtendedUser {
  name?: string | null
  email?: string | null
  phone?: string | null
  locale?: string
  level?: number
  xp?: number
  profileImage?: string | null
  notificationPreferences?: {
    email?: {
      orderUpdates?: boolean
      subscriptionUpdates?: boolean
      accountActivity?: boolean
      marketingAndPromotions?: boolean
      productNewsAndTips?: boolean
    }
    notificationFrequency?: 'immediately' | 'daily' | 'weekly' | 'never'
  }
}

// Placeholder server actions (implement these according to your backend logic)
async function updateProfile(data: any) {
  logDebug('Updating profile with data:', data)
  // Here you would call your actual API endpoint or server action
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  return { success: true }
}

async function changePassword(data: any) {
  logDebug('Changing password with data:', data)
  // Here you would call your actual API endpoint or server action
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  return { success: true }
}

async function updateNotificationPreferences(data: any) {
  logDebug('Updating notification preferences:', data)
  // Here you would call your actual API endpoint or server action
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  return { success: true }
}

// Sample achievements data (replace with actual data from your backend)
const sampleAchievements = [
  {
    id: '1',
    title: 'Начало пути',
    description: 'Успешно завершите свой первый курс',
    icon: 'trophy',
    dateEarned: '15.03.2025',
  },
  {
    id: '2',
    title: 'Активный ученик',
    description: 'Пройдите 5 уроков за одну неделю',
    icon: 'star',
    progress: 60,
  },
  {
    id: '3',
    title: 'Мастер знаний',
    description: 'Завершите 10 курсов с отличием',
    icon: 'award',
    isLocked: true,
  },
]

export default function ProfilePage() {
  const t = useTranslations('Account.Profile')
  const [activeTab, setActiveTab] = useState('personal')
  
  // Get user data from auth context
  const { user, isLoading } = useAuth()
  
  // Placeholder user data if not available from auth context
  const fallbackData: ExtendedUser = {
    name: 'Иван Петров',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    locale: 'ru',
    level: 3,
    xp: 275,
    profileImage: null,
    notificationPreferences: {
      email: {
        orderUpdates: true,
        subscriptionUpdates: true,
        accountActivity: true,
        marketingAndPromotions: false,
        productNewsAndTips: true,
      },
      notificationFrequency: 'daily',
    },
  }
  
  // Merge user data with fallback data to ensure all fields are available
  const userData: ExtendedUser = user ? { ...fallbackData, ...user } : fallbackData
  
  // Handle profile update
  const handleProfileUpdate = async (data: any) => {
    try {
      await updateProfile(data)
    } catch (error) {
      logError('Error updating profile:', error)
    }
  }
  
  // Handle password change
  const handlePasswordChange = async (data: any) => {
    try {
      await changePassword(data)
    } catch (error) {
      logError('Error changing password:', error)
    }
  }
  
  // Handle notification preferences update
  const handleNotificationUpdate = async (data: any) => {
    try {
      await updateNotificationPreferences(data)
    } catch (error) {
      logError('Error updating notification preferences:', error)
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 py-8">
        <div className="h-12 bg-muted rounded-md w-1/3"></div>
        <div className="h-48 bg-muted rounded-xl"></div>
        <div className="h-8 bg-muted rounded-md w-1/2"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <PageHeading title={t('title')} />
      
      {/* Profile Card */}
      <ProfileCard user={userData} />
      
      {/* Tab Navigation */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Tab Content */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        {activeTab === 'personal' && (
          <PersonalInfoTab 
            user={userData} 
            onUpdate={handleProfileUpdate} 
          />
        )}
        
        {activeTab === 'security' && (
          <SecurityTab 
            onPasswordChange={handlePasswordChange} 
          />
        )}
        
        {activeTab === 'notifications' && (
          <NotificationsTab
            preferences={userData.notificationPreferences || {}}
            onUpdate={handleNotificationUpdate}
          />
        )}
        
        {activeTab === 'achievements' && (
          <AchievementsTab
            achievements={sampleAchievements}
            level={userData.level || 1}
            xp={userData.xp || 0}
            nextLevelXp={500}
          />
        )}
      </div>
    </div>
  )
}