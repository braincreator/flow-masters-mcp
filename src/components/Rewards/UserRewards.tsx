'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserRewards, useReward, activateDiscountFromReward } from '@/lib/api/rewards'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader2, Gift, Check, Clock, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface UserRewardsProps {
  userId?: string
  showAll?: boolean
  className?: string
}

type Reward = {
  id: string
  status: string
  awardedAt: string
  expiresAt: string | null
  usedAt: string | null
  code: string | null
  reward: {
    id: string
    title: string
    description: string
    type: string
    rewardType: string
    icon: {
      url: string
    }
    discountValue: number | null
  }
}

export default function UserRewards({ userId, showAll = true, className = '' }: UserRewardsProps) {
  const { user: authUser } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('active')
  const [usingReward, setUsingReward] = useState<string | null>(null)

  // Используем ID пользователя из пропсов или из авторизованного пользователя
  const userIdToUse = userId || authUser?.id

  useEffect(() => {
    const loadRewards = async () => {
      if (!userIdToUse) return

      try {
        setLoading(true)
        const data = await getUserRewards(userIdToUse)
        setRewards(data)
      } catch (err) {
        logError('Error loading rewards:', err)
        setError('Не удалось загрузить награды')
      } finally {
        setLoading(false)
      }
    }

    loadRewards()
  }, [userIdToUse])

  const handleUseReward = async (rewardId: string, reward?: Reward) => {
    // Если reward не передан, находим его в списке
    const rewardData = reward || rewards.find((r) => r.id === rewardId)
    try {
      setUsingReward(rewardId)

      if (
        rewardData &&
        typeof rewardData.reward === 'object' &&
        rewardData.reward.rewardType === 'discount'
      ) {
        // Если это награда-скидка, используем специальный метод
        const result = await activateDiscountFromReward(rewardId)

        if (result.success && result.discountCode) {
          // Показываем код скидки
          setRewards(
            rewards.map((r) =>
              r.id === rewardId
                ? {
                    ...r,
                    status: 'used',
                    usedAt: new Date().toISOString(),
                    code: result.discountCode,
                    metadata: { ...r.metadata, discountCode: result.discountCode },
                  }
                : r,
            ),
          )
        }
      } else {
        // Для других типов наград используем обычный метод
        await useReward(rewardId)

        // Обновляем список наград
        setRewards(
          rewards.map((r) =>
            r.id === rewardId ? { ...r, status: 'used', usedAt: new Date().toISOString() } : r,
          ),
        )
      }
    } catch (err) {
      logError('Error using reward:', err)
      setError('Не удалось использовать награду')
    } finally {
      setUsingReward(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Gift className="h-4 w-4 text-green-500" />
      case 'used':
        return <Check className="h-4 w-4 text-blue-500" />
      case 'expired':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'revoked':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна'
      case 'used':
        return 'Использована'
      case 'expired':
        return 'Истекла'
      case 'revoked':
        return 'Отозвана'
      default:
        return status
    }
  }

  const getRewardTypeText = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Скидка'
      case 'free_course':
        return 'Бесплатный курс'
      case 'badge':
        return 'Бейдж'
      case 'certificate':
        return 'Сертификат'
      case 'exclusive_content':
        return 'Эксклюзивный контент'
      default:
        return 'Другое'
    }
  }

  if (!userIdToUse) {
    return null
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className={`text-red-500 p-2 ${className}`}>{error}</div>
  }

  if (rewards.length === 0) {
    return <div className={`text-gray-500 p-4 text-center ${className}`}>У вас пока нет наград</div>
  }

  // Фильтруем награды по статусу
  const activeRewards = rewards.filter((reward) => reward.status === 'active')
  const usedRewards = rewards.filter((reward) => reward.status === 'used')
  const expiredRewards = rewards.filter((reward) => ['expired', 'revoked'].includes(reward.status))

  // Если не нужно показывать все награды, показываем только активные
  if (!showAll) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold mb-4">Активные награды</h3>

        {activeRewards.length === 0 ? (
          <div className="text-gray-500 p-4 text-center">У вас нет активных наград</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRewards.map((reward) => (
              <div key={reward.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="flex p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                    {reward.reward.icon?.url ? (
                      <Image
                        src={reward.reward.icon.url}
                        alt={reward.reward.title}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Gift className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{reward.reward.title}</h4>
                    <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      {getStatusIcon(reward.status)}
                      <span>{getStatusText(reward.status)}</span>
                      <span className="mx-1">•</span>
                      <span>{getRewardTypeText(reward.reward.rewardType)}</span>
                      {reward.reward.discountValue && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{reward.reward.discountValue}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div
                    className="text-sm mb-3"
                    dangerouslySetInnerHTML={{ __html: reward.reward.description }}
                  />

                  {reward.code && (
                    <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-center font-mono">
                      {reward.code}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>Получено: {new Date(reward.awardedAt).toLocaleDateString()}</div>
                    {reward.expiresAt && (
                      <div>Истекает: {new Date(reward.expiresAt).toLocaleDateString()}</div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-3"
                    onClick={() => handleUseReward(reward.id)}
                    disabled={usingReward === reward.id}
                  >
                    {usingReward === reward.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Применение...
                      </>
                    ) : (
                      'Использовать награду'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-2xl font-bold mb-6">Мои награды</h2>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="active">Активные ({activeRewards.length})</TabsTrigger>
          <TabsTrigger value="used">Использованные ({usedRewards.length})</TabsTrigger>
          <TabsTrigger value="expired">Истекшие ({expiredRewards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRewards.length === 0 ? (
            <div className="text-gray-500 p-4 text-center">У вас нет активных наград</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRewards.map((reward) => (
                <div key={reward.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="flex p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                      {reward.reward.icon?.url ? (
                        <Image
                          src={reward.reward.icon.url}
                          alt={reward.reward.title}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Gift className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{reward.reward.title}</h4>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        {getStatusIcon(reward.status)}
                        <span>{getStatusText(reward.status)}</span>
                        <span className="mx-1">•</span>
                        <span>{getRewardTypeText(reward.reward.rewardType)}</span>
                        {reward.reward.discountValue && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{reward.reward.discountValue}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div
                      className="text-sm mb-3"
                      dangerouslySetInnerHTML={{ __html: reward.reward.description }}
                    />

                    {reward.code && (
                      <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-center font-mono">
                        {reward.code}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>Получено: {new Date(reward.awardedAt).toLocaleDateString()}</div>
                      {reward.expiresAt && (
                        <div>Истекает: {new Date(reward.expiresAt).toLocaleDateString()}</div>
                      )}
                    </div>

                    <Button
                      className="w-full mt-3"
                      onClick={() => handleUseReward(reward.id, reward)}
                      disabled={usingReward === reward.id}
                    >
                      {usingReward === reward.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Применение...
                        </>
                      ) : reward.reward.rewardType === 'discount' ? (
                        'Активировать скидку'
                      ) : (
                        'Использовать награду'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          {usedRewards.length === 0 ? (
            <div className="text-gray-500 p-4 text-center">У вас нет использованных наград</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border rounded-lg overflow-hidden shadow-sm opacity-75"
                >
                  <div className="flex p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                      {reward.reward.icon?.url ? (
                        <Image
                          src={reward.reward.icon.url}
                          alt={reward.reward.title}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Gift className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{reward.reward.title}</h4>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        {getStatusIcon(reward.status)}
                        <span>{getStatusText(reward.status)}</span>
                        <span className="mx-1">•</span>
                        <span>{getRewardTypeText(reward.reward.rewardType)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div
                      className="text-sm mb-3"
                      dangerouslySetInnerHTML={{ __html: reward.reward.description }}
                    />

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>Получено: {new Date(reward.awardedAt).toLocaleDateString()}</div>
                      {reward.usedAt && (
                        <div>Использовано: {new Date(reward.usedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredRewards.length === 0 ? (
            <div className="text-gray-500 p-4 text-center">У вас нет истекших наград</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiredRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border rounded-lg overflow-hidden shadow-sm opacity-50"
                >
                  <div className="flex p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                      {reward.reward.icon?.url ? (
                        <Image
                          src={reward.reward.icon.url}
                          alt={reward.reward.title}
                          fill
                          className="object-contain grayscale"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Gift className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{reward.reward.title}</h4>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        {getStatusIcon(reward.status)}
                        <span>{getStatusText(reward.status)}</span>
                        <span className="mx-1">•</span>
                        <span>{getRewardTypeText(reward.reward.rewardType)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div
                      className="text-sm mb-3"
                      dangerouslySetInnerHTML={{ __html: reward.reward.description }}
                    />

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>Получено: {new Date(reward.awardedAt).toLocaleDateString()}</div>
                      {reward.expiresAt && (
                        <div>Истекло: {new Date(reward.expiresAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
