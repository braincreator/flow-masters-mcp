'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface LandingPreviewProps {
  landingData: any
  courseTitle?: string
}

export function LandingPreview({ landingData, courseTitle }: LandingPreviewProps) {
  if (!landingData) {
    return <div>Нет данных для предпросмотра лендинга</div>
  }

  const title = landingData.title || courseTitle || 'Название курса'
  const hero = landingData.hero || {}
  const sections = landingData.sections || []

  return (
    <div className="space-y-8 max-w-4xl mx-auto bg-white">
      {/* Hero секция */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {hero.backgroundImage && (
          <div className="absolute inset-0">
            <img 
              src={hero.backgroundImage} 
              alt="Hero background" 
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        )}
        
        <div className="relative z-10 px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {hero.heading || title}
          </h1>
          
          {hero.subheading && (
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
              {hero.subheading}
            </p>
          )}
          
          {hero.ctaText && (
            <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90">
              {hero.ctaText}
            </Button>
          )}
        </div>
      </div>
      
      {/* Секции лендинга */}
      {sections.map((section: any, index: number) => (
        <div key={index} className="py-12 px-6">
          {renderSection(section)}
        </div>
      ))}
      
      {/* Программа курса (добавляется автоматически) */}
      <div className="py-12 px-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Программа курса</h2>
        <div className="space-y-4">
          {/* Здесь будет отображаться программа курса */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 bg-blue-50 border-b">
                <h3 className="font-medium">Модуль 1: Введение в курс</h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="mr-2">1.1</span>
                    <span>Знакомство с материалами</span>
                  </div>
                  <Badge variant="outline">30 мин</Badge>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="mr-2">1.2</span>
                    <span>Основные концепции</span>
                  </div>
                  <Badge variant="outline">45 мин</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 bg-blue-50 border-b">
                <h3 className="font-medium">Модуль 2: Практическое применение</h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="mr-2">2.1</span>
                    <span>Практические задания</span>
                  </div>
                  <Badge variant="outline">60 мин</Badge>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="mr-2">2.2</span>
                    <span>Разбор примеров</span>
                  </div>
                  <Badge variant="outline">45 мин</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* CTA секция (добавляется автоматически) */}
      <div className="py-12 px-6 bg-blue-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Готовы начать обучение?</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Запишитесь на курс прямо сейчас и начните свой путь к новым знаниям.
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          {hero.ctaText || 'Записаться на курс'}
        </Button>
      </div>
      
      {/* Форма подписки (добавляется автоматически) */}
      <div className="py-12 px-6 bg-white border rounded-lg">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Записаться на курс</h2>
          <p className="text-gray-600 mb-4">Оставьте свои контактные данные, и мы свяжемся с вами</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ваше имя</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md" 
                placeholder="Введите ваше имя"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded-md" 
                placeholder="Введите ваш email"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <input 
                type="tel" 
                className="w-full p-2 border rounded-md" 
                placeholder="Введите ваш телефон"
                disabled
              />
            </div>
            
            <Button className="w-full">Отправить заявку</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Функция для рендеринга различных типов секций
function renderSection(section: any) {
  const { type, content } = section
  
  switch (type) {
    case 'features':
      return (
        <div>
          {content.heading && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.heading}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.features?.map((feature: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  {feature.icon && (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <span className="text-blue-600 text-xl">{getIconForName(feature.icon)}</span>
                    </div>
                  )}
                  
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
      
    case 'testimonials':
      return (
        <div>
          {content.heading && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.heading}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.testimonials?.map((testimonial: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
                      {testimonial.avatar && (
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      {testimonial.title && (
                        <p className="text-sm text-gray-600">{testimonial.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                  
                  {testimonial.rating && (
                    <div className="flex mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
      
    case 'pricing':
      return (
        <div>
          {content.heading && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.heading}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.plans?.map((plan: any, index: number) => (
              <Card key={index} className={`overflow-hidden ${plan.featured ? 'border-blue-500 border-2' : ''}`}>
                <CardContent className="p-6">
                  {plan.featured && (
                    <Badge className="mb-4">Рекомендуемый</Badge>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-600"> / {plan.period}</span>}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <Separator className="my-4" />
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features?.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className={`w-full ${plan.featured ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                    {plan.buttonText || 'Выбрать план'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
      
    case 'faq':
      return (
        <div>
          {content.heading && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.heading}</h2>
          )}
          
          <div className="max-w-3xl mx-auto space-y-4">
            {content.questions?.map((item: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">{item.question}</div>
                  <p className="text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
      
    case 'content':
      return (
        <div className="max-w-3xl mx-auto">
          {content.heading && (
            <h2 className="text-2xl font-bold mb-4">{content.heading}</h2>
          )}
          
          <div className="prose prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.html || '' }} />
          </div>
        </div>
      )
      
    default:
      return (
        <div className="text-center py-4 text-gray-500">
          Секция типа "{type}" не поддерживается в предпросмотре
        </div>
      )
  }
}

// Вспомогательная функция для получения иконки по имени
function getIconForName(name: string) {
  const icons: Record<string, string> = {
    'brain': '🧠',
    'code': '💻',
    'settings': '⚙️',
    'certificate': '🎓',
    'star': '⭐',
    'book': '📚',
    'time': '⏱️',
    'money': '💰',
    'check': '✅',
    'user': '👤',
    'users': '👥',
    'heart': '❤️',
    'lightbulb': '💡',
    'rocket': '🚀',
    'target': '🎯',
    'chart': '📊',
    'globe': '🌎',
    'phone': '📱',
    'mail': '📧',
    'chat': '💬',
  }
  
  return icons[name] || '📌'
}

export default LandingPreview
