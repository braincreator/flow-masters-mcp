'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useNotification } from '@/hooks/useNotification'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Calendar as CalendarIcon, Download, Clock, CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react'
import { format, isToday, isFuture, isPast, addDays, isSameDay } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  status: string
  dueDate: string
  formattedDueDate: string
  completedAt?: string
  formattedCompletedDate?: string
  projectId: string
  projectName: string
}

interface ProjectCalendarSectionProps {
  projectId: string
  isAdmin: boolean
}

export default function ProjectCalendarSection({ projectId, isAdmin }: ProjectCalendarSectionProps) {
  const t = useTranslations('ProjectCalendar')
  const { showNotification } = useNotification()
  const [locale, setLocale] = useState<'ru' | 'en'>('ru') // Default to Russian
  
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [includeCompleted, setIncludeCompleted] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [timeZone, setTimeZone] = useState('UTC')
  
  // Get user's locale
  useEffect(() => {
    // This would typically come from user settings or browser locale
    const userLocale = document.documentElement.lang || navigator.language
    setLocale(userLocale.startsWith('ru') ? 'ru' : 'en')
    
    // Try to get user's timezone
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimeZone(userTimeZone)
    } catch (error) {
      console.error('Error getting timezone:', error)
    }
  }, [])
  
  // Fetch calendar events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const queryParams = new URLSearchParams({
          includeCompleted: includeCompleted.toString(),
          timeZone,
        })
        
        const response = await fetch(`/api/project-calendar/${projectId}?${queryParams}`)
        const responseData = await response.json()
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to fetch calendar events')
        }
        
        if (!responseData.success) {
          throw new Error(responseData.error || 'Failed to fetch calendar events')
        }
        
        setEvents(responseData.data.events)
      } catch (error) {
        console.error('Error fetching calendar events:', error)
        showNotification('error', t('errorFetchingEvents', { defaultValue: 'Error fetching calendar events' }))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvents()
  }, [projectId, includeCompleted, timeZone, showNotification, t])
  
  // Export calendar
  const exportCalendar = () => {
    try {
      const queryParams = new URLSearchParams({
        format: 'ical',
        includeCompleted: includeCompleted.toString(),
        timeZone,
      })
      
      // Create download link
      const downloadUrl = `/api/project-calendar/${projectId}?${queryParams}`
      
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `project-${projectId}-calendar.ics`
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showNotification('success', t('calendarExported', { defaultValue: 'Calendar exported successfully' }))
    } catch (error) {
      console.error('Error exporting calendar:', error)
      showNotification('error', t('errorExportingCalendar', { defaultValue: 'Error exporting calendar' }))
    }
  }
  
  // Get dates with events for calendar highlighting
  const datesWithEvents = useMemo(() => {
    return events
      .filter(event => event.dueDate)
      .map(event => new Date(event.dueDate))
  }, [events])
  
  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.dueDate) return false
      const eventDate = new Date(event.dueDate)
      return isSameDay(eventDate, date)
    })
  }, [events, date])
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const nextWeek = addDays(now, 7)
    
    return events
      .filter(event => {
        if (!event.dueDate) return false
        const eventDate = new Date(event.dueDate)
        return isFuture(eventDate) && eventDate <= nextWeek
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [events])
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <HelpCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'delayed':
        return <AlertCircle className="h-4 w-4" />
      case 'blocked':
        return <XCircle className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }
  
  // Get localized status text
  const getStatusText = (status: string) => {
    return t(`status.${status}`, { defaultValue: status })
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('projectCalendar', { defaultValue: 'Project Calendar' })}</h2>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCompleted"
              checked={includeCompleted}
              onCheckedChange={(checked) => setIncludeCompleted(checked as boolean)}
            />
            <Label htmlFor="includeCompleted">
              {t('includeCompleted', { defaultValue: 'Include completed' })}
            </Label>
          </div>
          
          <Button
            onClick={exportCalendar}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="h-4 w-4 mr-1" />
            {t('exportCalendar', { defaultValue: 'Export Calendar' })}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('calendar', { defaultValue: 'Calendar' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
              locale={locale === 'ru' ? ru : enUS}
              modifiers={{
                event: datesWithEvents,
              }}
              modifiersStyles={{
                event: { 
                  fontWeight: 'bold',
                  backgroundColor: 'var(--primary-50)',
                  borderBottom: '2px solid var(--primary)'
                }
              }}
            />
          </CardContent>
        </Card>
        
        {/* Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('milestones', { defaultValue: 'Milestones' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="selected" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="selected">
                  {t('selectedDate', { defaultValue: 'Selected Date' })}
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  {t('upcoming', { defaultValue: 'Upcoming' })}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="selected">
                <div className="mb-2 text-sm text-gray-500">
                  {format(date, 'PPP', { locale: locale === 'ru' ? ru : enUS })}
                </div>
                
                {selectedDateEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      {t('noEventsForSelectedDate', { defaultValue: 'No milestones for selected date' })}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <Card key={event.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <div className="flex items-center mt-1 space-x-2">
                                <Badge className={getStatusColor(event.status)}>
                                  <span className="flex items-center">
                                    {getStatusIcon(event.status)}
                                    <span className="ml-1">{getStatusText(event.status)}</span>
                                  </span>
                                </Badge>
                              </div>
                              {event.description && (
                                <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upcoming">
                {upcomingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      {t('noUpcomingEvents', { defaultValue: 'No upcoming milestones' })}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <Card key={event.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <div className="flex items-center mt-1 space-x-2">
                                <Badge className={getStatusColor(event.status)}>
                                  <span className="flex items-center">
                                    {getStatusIcon(event.status)}
                                    <span className="ml-1">{getStatusText(event.status)}</span>
                                  </span>
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {event.formattedDueDate}
                                </span>
                              </div>
                              {event.description && (
                                <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
