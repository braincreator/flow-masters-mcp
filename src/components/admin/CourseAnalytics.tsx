'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, TrendingUp, Users, BookOpen, DollarSign, BarChart } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CourseAnalyticsProps {
  courseId?: string
}

export function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(courseId)
  
  useEffect(() => {
    if (courseId) {
      fetchCourseAnalytics(courseId)
    } else {
      fetchAllCoursesAnalytics()
    }
  }, [courseId])
  
  const fetchCourseAnalytics = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/v1/analytics/courses?courseId=${id}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при загрузке аналитики курса')
      }
      
      setAnalytics(result.data)
      setSelectedCourseId(id)
    } catch (error) {
      logError('Error fetching course analytics:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchAllCoursesAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/analytics/courses')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при загрузке аналитики курсов')
      }
      
      setCourses(result.data)
      
      if (result.data.length > 0) {
        setAnalytics(result.data[0])
        setSelectedCourseId(result.data[0].course)
      }
    } catch (error) {
      logError('Error fetching all courses analytics:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCourseChange = (id: string) => {
    const selectedCourse = courses.find(course => course.course === id)
    if (selectedCourse) {
      setAnalytics(selectedCourse)
      setSelectedCourseId(id)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (!analytics) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Нет данных аналитики
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {!courseId && courses.length > 0 && (
        <div className="max-w-xs">
          <Label htmlFor="courseSelect">Выберите курс</Label>
          <Select value={selectedCourseId} onValueChange={handleCourseChange}>
            <SelectTrigger id="courseSelect">
              <SelectValue placeholder="Выберите курс" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.course} value={course.course}>
                  {course.courseTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Просмотры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Записи на курс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analytics.enrollments.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Завершения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analytics.completions.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Доход</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analytics.totalRevenue.toLocaleString()} ₽</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="modules">Модули</TabsTrigger>
          <TabsTrigger value="lessons">Уроки</TabsTrigger>
          <TabsTrigger value="timeline">Временная шкала</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Конверсии</CardTitle>
              <CardDescription>Показатели конверсии на разных этапах воронки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Лендинг → Запись ({analytics.conversionRates?.landingToEnrollment.toFixed(1)}%)</span>
                    <span className="text-sm">{analytics.enrollments} / {analytics.views}</span>
                  </div>
                  <Progress value={analytics.conversionRates?.landingToEnrollment || 0} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Запись → Начало ({analytics.conversionRates?.enrollmentToStart.toFixed(1)}%)</span>
                    <span className="text-sm">{Math.round((analytics.enrollments * (analytics.conversionRates?.enrollmentToStart || 0)) / 100)} / {analytics.enrollments}</span>
                  </div>
                  <Progress value={analytics.conversionRates?.enrollmentToStart || 0} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Начало → Завершение ({analytics.conversionRates?.startToCompletion.toFixed(1)}%)</span>
                    <span className="text-sm">{analytics.completions} / {Math.round((analytics.enrollments * (analytics.conversionRates?.enrollmentToStart || 0)) / 100)}</span>
                  </div>
                  <Progress value={analytics.conversionRates?.startToCompletion || 0} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Общий процент завершения ({analytics.completionRate.toFixed(1)}%)</span>
                    <span className="text-sm">{analytics.completions} / {analytics.enrollments}</span>
                  </div>
                  <Progress value={analytics.completionRate || 0} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Рейтинг и вовлеченность</CardTitle>
              <CardDescription>Показатели удовлетворенности и вовлеченности студентов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Средняя оценка</h3>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">{analytics.averageRating.toFixed(1)}</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(analytics.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Процент завершения</h3>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">{analytics.completionRate.toFixed(1)}%</div>
                    <Progress value={analytics.completionRate || 0} className="flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по модулям</CardTitle>
              <CardDescription>Процент завершения по каждому модулю курса</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.moduleCompletionRates && analytics.moduleCompletionRates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Модуль</TableHead>
                      <TableHead>Процент завершения</TableHead>
                      <TableHead className="text-right">Прогресс</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.moduleCompletionRates.map((module: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{module.moduleTitle}</TableCell>
                        <TableCell>{module.completionRate.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">
                          <Progress value={module.completionRate || 0} className="w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Нет данных по модулям
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по урокам</CardTitle>
              <CardDescription>Процент завершения и среднее время по каждому уроку</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.lessonCompletionRates && analytics.lessonCompletionRates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Урок</TableHead>
                      <TableHead>Модуль</TableHead>
                      <TableHead>Процент завершения</TableHead>
                      <TableHead>Среднее время (мин)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.lessonCompletionRates.map((lesson: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{lesson.lessonTitle}</TableCell>
                        <TableCell>{lesson.moduleTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{lesson.completionRate.toFixed(1)}%</span>
                            <Progress value={lesson.completionRate || 0} className="w-24" />
                          </div>
                        </TableCell>
                        <TableCell>{lesson.averageTimeSpent.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Нет данных по урокам
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Временная шкала</CardTitle>
              <CardDescription>Статистика по дням</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.timeDistribution && analytics.timeDistribution.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Просмотры</TableHead>
                      <TableHead>Записи</TableHead>
                      <TableHead>Завершения</TableHead>
                      <TableHead>Доход</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.timeDistribution.map((day: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(day.date)}</TableCell>
                        <TableCell>{day.views}</TableCell>
                        <TableCell>{day.enrollments}</TableCell>
                        <TableCell>{day.completions}</TableCell>
                        <TableCell>{day.revenue.toLocaleString()} ₽</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Нет данных по временной шкале
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Вспомогательная функция для форматирования даты
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default CourseAnalytics
