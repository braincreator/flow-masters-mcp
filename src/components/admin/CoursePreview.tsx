'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import LandingPreview from './LandingPreview'

interface CoursePreviewProps {
  courseData: any
}

export function CoursePreview({ courseData }: CoursePreviewProps) {
  if (!courseData || !courseData.course) {
    return <div>Нет данных для предпросмотра</div>
  }

  const { course, landing, funnel } = courseData

  return (
    <Tabs defaultValue="course" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="course">Курс</TabsTrigger>
        <TabsTrigger value="landing" disabled={!landing}>
          Лендинг
        </TabsTrigger>
        <TabsTrigger value="funnel" disabled={!funnel}>
          Воронка
        </TabsTrigger>
      </TabsList>

      <TabsContent value="course" className="space-y-4">
        <CoursePreviewContent course={course} />
      </TabsContent>

      <TabsContent value="landing" className="space-y-4">
        {landing ? <LandingPreviewContent landing={landing} /> : <div>Лендинг не предоставлен</div>}
      </TabsContent>

      <TabsContent value="funnel" className="space-y-4">
        {funnel ? <FunnelPreviewContent funnel={funnel} /> : <div>Воронка не предоставлена</div>}
      </TabsContent>
    </Tabs>
  )
}

function CoursePreviewContent({ course }: { course: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{course.title}</CardTitle>
            <Badge variant={getBadgeVariant(course.difficulty)}>{course.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {course.excerpt && <p className="text-muted-foreground mb-4">{course.excerpt}</p>}
          {course.description && <div className="mb-4">{course.description}</div>}

          {course.estimatedDuration && (
            <div className="mb-4">
              <strong>Продолжительность:</strong> {course.estimatedDuration}
            </div>
          )}

          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Чему вы научитесь</h3>
              <ul className="list-disc pl-5 space-y-1">
                {course.learningOutcomes.map((outcome: string, index: number) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {course.requirements && course.requirements.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Требования</h3>
              <ul className="list-disc pl-5 space-y-1">
                {course.requirements.map((requirement: string, index: number) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {course.targetAudience && course.targetAudience.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Для кого этот курс</h3>
              <ul className="list-disc pl-5 space-y-1">
                {course.targetAudience.map((audience: string, index: number) => (
                  <li key={index}>{audience}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Программа курса</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {course.modules.map((module: any, moduleIndex: number) => (
              <AccordionItem key={moduleIndex} value={`module-${moduleIndex}`}>
                <AccordionTrigger>
                  <div className="flex items-center">
                    <span className="mr-2">{moduleIndex + 1}.</span>
                    <span>{module.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {module.description && <p className="mb-4">{module.description}</p>}

                  <div className="space-y-2">
                    {module.lessons.map((lesson: any, lessonIndex: number) => (
                      <div key={lessonIndex} className="border p-3 rounded-md">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">
                              {moduleIndex + 1}.{lessonIndex + 1}. {lesson.title}
                            </span>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {lesson.type && (
                              <Badge variant="outline">{getLessonTypeLabel(lesson.type)}</Badge>
                            )}
                            {lesson.duration && (
                              <span className="text-sm text-muted-foreground">
                                {lesson.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

function LandingPreviewContent({ landing }: { landing: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр лендинга</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <LandingPreview landingData={landing} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Структура лендинга</CardTitle>
        </CardHeader>
        <CardContent>
          {landing.hero && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Hero секция</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Заголовок:</span>
                  <p className="text-sm">{landing.hero.heading}</p>
                </div>
                {landing.hero.subheading && (
                  <div>
                    <span className="text-sm font-medium">Подзаголовок:</span>
                    <p className="text-sm">{landing.hero.subheading}</p>
                  </div>
                )}
                {landing.hero.ctaText && (
                  <div>
                    <span className="text-sm font-medium">Текст кнопки:</span>
                    <p className="text-sm">{landing.hero.ctaText}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {landing.sections && landing.sections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Секции лендинга</h3>
              <Accordion type="single" collapsible className="w-full">
                {landing.sections.map((section: any, index: number) => (
                  <AccordionItem key={index} value={`section-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span className="mr-2">{index + 1}.</span>
                        <span>{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm">
                        {JSON.stringify(section.content, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FunnelPreviewContent({ funnel }: { funnel: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Шаги воронки</CardTitle>
        </CardHeader>
        <CardContent>
          {funnel.steps && funnel.steps.length > 0 ? (
            <div className="space-y-2">
              {funnel.steps.map((step: any, index: number) => (
                <div key={index} className="flex items-center p-3 border rounded-md">
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {step.id}</div>
                  </div>
                  {step.triggerType && <Badge variant="outline">{step.triggerType}</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <div>Нет шагов воронки</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email-последовательность</CardTitle>
        </CardHeader>
        <CardContent>
          {funnel.emailSequence && funnel.emailSequence.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {funnel.emailSequence.map((email: any, index: number) => (
                <AccordionItem key={index} value={`email-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <span className="mr-2">{index + 1}.</span>
                      <span>{email.subject}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div>Задержка: {email.delay || 0} дней</div>
                        <div>Триггер: {email.triggerEvent || 'signup'}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                        {email.content}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div>Нет email-последовательности</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Вспомогательные функции
function getBadgeVariant(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return 'secondary'
    case 'intermediate':
      return 'default'
    case 'advanced':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getLessonTypeLabel(type: string) {
  switch (type) {
    case 'video':
      return 'Видео'
    case 'text':
      return 'Текст'
    case 'quiz':
      return 'Тест'
    case 'assignment':
      return 'Задание'
    default:
      return type
  }
}

export default CoursePreview
