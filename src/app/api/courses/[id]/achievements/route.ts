import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const courseId = params.id
    
    // Получаем все достижения, связанные с этим курсом
    const achievements = await payload.find({
      collection: 'achievements',
      where: {
        and: [
          {
            status: { equals: 'active' },
          },
          {
            courseId: { equals: courseId },
          },
        ],
      },
    })
    
    // Получаем достижения пользователя
    const userAchievements = await payload.find({
      collection: 'user-achievements',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1, // Включаем данные о достижениях
    })
    
    // Создаем карту полученных достижений для быстрого поиска
    const userAchievementMap = new Map()
    userAchievements.docs.forEach((ua) => {
      if (typeof ua.achievement === 'object' && ua.achievement !== null) {
        userAchievementMap.set(ua.achievement.id, ua)
      } else {
        userAchievementMap.set(ua.achievement, ua)
      }
    })
    
    // Добавляем информацию о том, получено ли достижение пользователем
    const achievementsWithStatus = achievements.docs.map((achievement) => {
      const isEarned = userAchievementMap.has(achievement.id)
      return {
        ...achievement,
        isEarned,
        earnedAt: isEarned ? userAchievementMap.get(achievement.id).awardedAt : null,
      }
    })
    
    return NextResponse.json(achievementsWithStatus)
  } catch (error) {
    console.error('Error fetching course achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course achievements' },
      { status: 500 }
    )
  }
}
