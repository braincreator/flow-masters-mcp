'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { User, Medal, Award, BarChart3 } from 'lucide-react'

interface ProfileCardProps {
  user: {
    name?: string | null
    email?: string | null
    level?: number
    xp?: number
    profileImage?: string | null
  }
}

export function ProfileCard({ user }: ProfileCardProps) {
  const t = useTranslations('Account.Profile')
  
  return (
    <div className="bg-gradient-to-br from-background to-muted/50 rounded-xl p-6 border shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-background shadow-md">
          {user.profileImage ? (
            <Image 
              src={user.profileImage} 
              alt={user.name || t('defaultName')}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <User className="w-12 h-12 text-muted-foreground/60" />
            </div>
          )}
        </div>
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-1">{user.name || t('defaultName')}</h2>
          <p className="text-muted-foreground mb-3">{user.email}</p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 text-sm bg-muted/70 px-3 py-1.5 rounded-full">
              <Medal className="w-4 h-4 text-amber-500" />
              <span>{t('level')} {user.level || 1}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm bg-muted/70 px-3 py-1.5 rounded-full">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>{user.xp || 0} XP</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm bg-muted/70 px-3 py-1.5 rounded-full">
              <Award className="w-4 h-4 text-violet-500" />
              <span>{t('achievements')} 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}