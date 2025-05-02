'use client'

import React from 'react'
import { Award, Star } from 'lucide-react'
import { Progress } from '@/components/ui/progress' // Assuming progress bar exists

interface LessonGamificationInfoProps {
  lessonId: string
  // TODO: Define props for points earned, relevant achievements, etc.
  // Example props:
  pointsEarned?: number
  relatedAchievements?: {
    id: string
    title: string
    iconUrl?: string
    currentProgress: number
    targetValue: number
  }[]
}

export function LessonGamificationInfo({
  lessonId,
  pointsEarned,
  relatedAchievements,
}: LessonGamificationInfoProps) {

  // TODO: Fetch gamification data based on lessonId or receive via props/context

  if (!pointsEarned && (!relatedAchievements || relatedAchievements.length === 0)) {
    // Don't render anything if there's no gamification info to show
    return null
  }

  return (
    <div className="mt-6 p-4 border rounded-lg bg-muted/30 space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">Lesson Rewards & Progress</h4>
      {pointsEarned && (
        <div className="flex items-center text-sm">
          <Star className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Points Earned: <span className="font-bold">{pointsEarned} XP</span></span>
        </div>
      )}
      {relatedAchievements?.map(ach => (
        <div key={ach.id} className="text-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-primary/80" />
              <span className="font-medium">{ach.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{ach.currentProgress}/{ach.targetValue}</span>
          </div>
          <Progress value={(ach.currentProgress / ach.targetValue) * 100} max={100} className="h-1.5" />
        </div>
      ))}
    </div>
  )
}