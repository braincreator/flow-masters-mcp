'use client'

import React, { useState } from 'react'
import { ContactForm } from '@/components/contact/ContactForm'
import { Newsletter } from '@/components/Newsletter'
import { PrivacyConsent } from '@/components/forms/PrivacyConsent'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface PrivacyConsentTestClientProps {
  locale: string
}

export function PrivacyConsentTestClient({ locale }: PrivacyConsentTestClientProps) {
  const t = useTranslations('forms.privacyConsent')
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  // Тестовые состояния для компонента согласия
  const [testConsent1, setTestConsent1] = useState(false)
  const [testConsent2, setTestConsent2] = useState(false)
  const [testConsent3, setTestConsent3] = useState(false)

  const markTestResult = (testName: string, passed: boolean) => {
    setTestResults(prev => ({ ...prev, [testName]: passed }))
  }

  const TestResultBadge = ({ testName }: { testName: string }) => {
    const result = testResults[testName]
    if (result === undefined) {
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Не протестировано</Badge>
    }
    return result ? (
      <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Пройден</Badge>
    ) : (
      <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Провален</Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Общая статистика тестов */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика тестирования</CardTitle>
          <CardDescription>
            Результаты проверки соответствия ФЗ-152 "О персональных данных"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Пройдено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter(r => r === false).length}
              </div>
              <div className="text-sm text-muted-foreground">Провалено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm text-muted-foreground">Всего тестов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="component" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="component">Компонент</TabsTrigger>
          <TabsTrigger value="contact">Контакты</TabsTrigger>
          <TabsTrigger value="newsletter">Рассылка</TabsTrigger>
          <TabsTrigger value="forms">Другие формы</TabsTrigger>
        </TabsList>

        {/* Тестирование компонента согласия */}
        <TabsContent value="component" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Тестирование компонента PrivacyConsent
                <TestResultBadge testName="privacy-component" />
              </CardTitle>
              <CardDescription>
                Проверка различных состояний и размеров компонента согласия
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Размер SM */}
              <div>
                <h4 className="font-medium mb-2">Размер: Small</h4>
                <PrivacyConsent
                  id="test-consent-sm"
                  checked={testConsent1}
                  onCheckedChange={setTestConsent1}
                  size="sm"
                />
              </div>

              {/* Размер MD */}
              <div>
                <h4 className="font-medium mb-2">Размер: Medium (по умолчанию)</h4>
                <PrivacyConsent
                  id="test-consent-md"
                  checked={testConsent2}
                  onCheckedChange={setTestConsent2}
                  size="md"
                />
              </div>

              {/* Размер LG */}
              <div>
                <h4 className="font-medium mb-2">Размер: Large</h4>
                <PrivacyConsent
                  id="test-consent-lg"
                  checked={testConsent3}
                  onCheckedChange={setTestConsent3}
                  size="lg"
                />
              </div>

              {/* Состояние с ошибкой */}
              <div>
                <h4 className="font-medium mb-2">Состояние с ошибкой</h4>
                <PrivacyConsent
                  id="test-consent-error"
                  checked={false}
                  onCheckedChange={() => {}}
                  error="Необходимо согласие на обработку персональных данных"
                  size="md"
                />
              </div>

              {/* Отключенное состояние */}
              <div>
                <h4 className="font-medium mb-2">Отключенное состояние</h4>
                <PrivacyConsent
                  id="test-consent-disabled"
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled={true}
                  size="md"
                />
              </div>

              <Button 
                onClick={() => markTestResult('privacy-component', true)}
                className="w-full"
              >
                Отметить тест как пройденный
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Тестирование контактной формы */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Контактная форма
                <TestResultBadge testName="contact-form" />
              </CardTitle>
              <CardDescription>
                Проверка интеграции согласия в контактную форму
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
              <div className="mt-4">
                <Button 
                  onClick={() => markTestResult('contact-form', true)}
                  variant="outline"
                  className="w-full"
                >
                  Отметить тест как пройденный
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Тестирование формы рассылки */}
        <TabsContent value="newsletter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Форма подписки на рассылку
                <TestResultBadge testName="newsletter-form" />
              </CardTitle>
              <CardDescription>
                Проверка согласия в формах подписки (stacked и inline)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Layout: Stacked</h4>
                <Newsletter 
                  layout="stacked"
                  locale={locale}
                  forceShow={true}
                  storageKey="test_newsletter_stacked"
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Layout: Inline</h4>
                <Newsletter 
                  layout="inline"
                  locale={locale}
                  forceShow={true}
                  storageKey="test_newsletter_inline"
                />
              </div>

              <Button 
                onClick={() => markTestResult('newsletter-form', true)}
                variant="outline"
                className="w-full"
              >
                Отметить тест как пройденный
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Другие формы */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Другие формы с согласием</CardTitle>
              <CardDescription>
                Список других форм, которые должны содержать согласие
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Форма регистрации</div>
                    <div className="text-sm text-muted-foreground">RegisterForm в /register</div>
                  </div>
                  <TestResultBadge testName="register-form" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Модальная лид-форма</div>
                    <div className="text-sm text-muted-foreground">ModalLeadForm в AI Agency</div>
                  </div>
                  <TestResultBadge testName="lead-form" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Форма комментариев</div>
                    <div className="text-sm text-muted-foreground">CommentForm в блоге</div>
                  </div>
                  <TestResultBadge testName="comment-form" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Форма оформления подписки</div>
                    <div className="text-sm text-muted-foreground">SubscriptionCheckout</div>
                  </div>
                  <TestResultBadge testName="subscription-form" />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button 
                  onClick={() => {
                    markTestResult('register-form', true)
                    markTestResult('lead-form', true)
                    markTestResult('comment-form', true)
                    markTestResult('subscription-form', true)
                  }}
                  className="w-full"
                >
                  Отметить все формы как протестированные
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
