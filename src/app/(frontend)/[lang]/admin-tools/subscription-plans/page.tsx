'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Plus, RefreshCw } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string | { ru: string; en: string }
  description?: string | { ru: string; en: string }
  price: number | { ru: number; en: number }
  currency: string | { ru: string; en: string }
  period: string
  isActive: boolean
  isPopular: boolean
  features?: Array<{ feature: string; id?: string }>
  metadata?: any
  createdAt: string
  updatedAt: string
}

export default function SubscriptionPlansAdminPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/plans?limit=100')
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.plans || [])
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch plans' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching plans' })
    } finally {
      setLoading(false)
    }
  }

  const deleteAllPlans = async () => {
    if (!confirm('Are you sure you want to delete ALL subscription plans? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      
      // Удаляем каждый план через API
      for (const plan of plans) {
        await fetch(`/api/subscription/plans/${plan.id}`, {
          method: 'DELETE',
        })
      }
      
      setMessage({ type: 'success', text: `Deleted ${plans.length} plans successfully` })
      await fetchPlans()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting plans' })
    } finally {
      setLoading(false)
    }
  }

  const createAIAgencyPlans = async () => {
    try {
      setLoading(true)
      
      const newPlans = [
        {
          name: {
            ru: 'Стартер',
            en: 'Starter'
          },
          description: {
            ru: 'Идеальное решение для малого бизнеса',
            en: 'Perfect solution for small business'
          },
          features: {
            ru: [
              { feature: 'ИИ-чатбот для 1 платформы' },
              { feature: 'Базовая интеграция с CRM' },
              { feature: 'Автоответчик и FAQ-бот' },
              { feature: 'Техподдержка 30 дней' },
              { feature: 'Обучение команды (4 часа)' },
              { feature: 'Настройка включена' }
            ],
            en: [
              { feature: 'AI chatbot for 1 platform' },
              { feature: 'Basic CRM integration' },
              { feature: 'Auto-responder and FAQ bot' },
              { feature: '30 days technical support' },
              { feature: 'Team training (4 hours)' },
              { feature: 'Setup included' }
            ]
          },
          price: {
            ru: 89000,
            en: 999
          },
          currency: {
            ru: 'RUB',
            en: 'USD'
          },
          period: 'monthly',
          isActive: true,
          isPopular: false,
          trialPeriodDays: 0,
          maxSubscriptionMonths: 0,
          autoRenew: false,
          allowCancel: true,
          metadata: {
            category: 'ai-agency',
            prepaymentPercentage: 50
          }
        },
        {
          name: {
            ru: 'Профессионал',
            en: 'Professional'
          },
          description: {
            ru: 'Для растущего бизнеса с полной автоматизацией',
            en: 'For growing business with complete automation'
          },
          features: {
            ru: [
              { feature: 'ИИ-чатботы для 3 платформ' },
              { feature: 'Продвинутая интеграция CRM/ERP' },
              { feature: 'Автоматизация email и SMS' },
              { feature: 'Аналитика в реальном времени' },
              { feature: 'Лид-скоринг и сегментация' },
              { feature: 'Техподдержка 90 дней' },
              { feature: 'Обучение команды (12 часов)' },
              { feature: 'Настройка бизнес-процессов' }
            ],
            en: [
              { feature: 'AI chatbots for 3 platforms' },
              { feature: 'Advanced CRM/ERP integration' },
              { feature: 'Email and SMS marketing automation' },
              { feature: 'Real-time analytics and reports' },
              { feature: 'Lead scoring and segmentation' },
              { feature: '90 days technical support' },
              { feature: 'Team training (12 hours)' },
              { feature: 'Business process setup' }
            ]
          },
          price: {
            ru: 189000,
            en: 2099
          },
          currency: {
            ru: 'RUB',
            en: 'USD'
          },
          period: 'monthly',
          isActive: true,
          isPopular: true,
          trialPeriodDays: 0,
          maxSubscriptionMonths: 0,
          autoRenew: false,
          allowCancel: true,
          metadata: {
            category: 'ai-agency',
            prepaymentPercentage: 30
          }
        },
        {
          name: {
            ru: 'Корпоративный',
            en: 'Enterprise'
          },
          description: {
            ru: 'Максимальное решение для крупного бизнеса',
            en: 'Maximum solution for large business'
          },
          features: {
            ru: [
              { feature: 'Неограниченные ИИ-решения' },
              { feature: 'Индивидуальная разработка' },
              { feature: 'Полная автоматизация процессов' },
              { feature: 'Выделенный менеджер проекта' },
              { feature: 'Приоритетная поддержка 24/7' },
              { feature: 'Продвинутая аналитика и BI' },
              { feature: 'Обучение команды (40 часов)' },
              { feature: 'Консультации по ИИ-стратегии' },
              { feature: 'SLA гарантии 99.9%' },
              { feature: 'API доступ и интеграции' }
            ],
            en: [
              { feature: 'Unlimited AI solutions' },
              { feature: 'Custom development for specific needs' },
              { feature: 'Complete automation of all processes' },
              { feature: 'Dedicated project manager' },
              { feature: 'Priority 24/7 support' },
              { feature: 'Advanced analytics and BI' },
              { feature: 'Team training (40 hours)' },
              { feature: 'AI strategy consultations' },
              { feature: '99.9% SLA guarantees' },
              { feature: 'API access and integrations' }
            ]
          },
          price: {
            ru: 399000,
            en: 4399
          },
          currency: {
            ru: 'RUB',
            en: 'USD'
          },
          period: 'monthly',
          isActive: true,
          isPopular: false,
          trialPeriodDays: 0,
          maxSubscriptionMonths: 0,
          autoRenew: false,
          allowCancel: true,
          metadata: {
            category: 'ai-agency',
            prepaymentPercentage: 20
          }
        }
      ]

      // Создаем планы через API
      for (const planData of newPlans) {
        const response = await fetch('/api/subscription/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        })
        
        if (!response.ok) {
          throw new Error(`Failed to create plan: ${planData.name.ru}`)
        }
      }
      
      setMessage({ type: 'success', text: `Created ${newPlans.length} AI Agency plans successfully` })
      await fetchPlans()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating plans' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const formatPlanName = (name: string | { ru: string; en: string }) => {
    if (typeof name === 'string') return name
    return `${name.ru} / ${name.en}`
  }

  const formatPrice = (price: number | { ru: number; en: number }, currency: string | { ru: string; en: string }) => {
    if (typeof price === 'number' && typeof currency === 'string') {
      return `${price} ${currency}`
    }
    if (typeof price === 'object' && typeof currency === 'object') {
      return `${price.ru} ${currency.ru} / ${price.en} ${currency.en}`
    }
    return 'N/A'
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Subscription Plans Admin</h1>
        <p className="text-muted-foreground">
          Manage subscription plans in the database. Use with caution!
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-8">
        <Button onClick={fetchPlans} disabled={loading} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={deleteAllPlans} disabled={loading || plans.length === 0} variant="destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete All Plans ({plans.length})
        </Button>
        <Button onClick={createAIAgencyPlans} disabled={loading} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Create AI Agency Plans
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Plans ({plans.length})</CardTitle>
            <CardDescription>
              All subscription plans currently in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No plans found
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{formatPlanName(plan.name)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(plan.price, plan.currency)} • {plan.period}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {plan.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Active
                            </span>
                          )}
                          {plan.isPopular && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              Popular
                            </span>
                          )}
                          {plan.metadata?.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {plan.metadata.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {plan.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
