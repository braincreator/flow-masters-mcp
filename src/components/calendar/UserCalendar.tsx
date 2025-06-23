'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  type: 'course' | 'meeting' | 'webinar' | 'deadline' | 'other'
  url?: string
  attendees?: number
}

interface UserCalendarProps {
  locale: string
}

export function UserCalendar({ locale }: UserCalendarProps) {
  const t = useTranslations('Calendar')
  const { user, isAuthenticated, isLoading } = useAuth()
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  // Fetch user's events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAuthenticated || !user) return

      try {
        setLoading(true)
        // In a real app, you would fetch events from an API
        const response = await fetch(`/api/v1/user/${user.id}/events`)
        
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        } else {
          // For demo purposes, use mock data
          setTimeout(() => {
            setEvents([
              {
                id: '1',
                title: 'Introduction to Automation',
                description: 'Learn the basics of automation with n8n',
                startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
                endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
                type: 'course',
              },
              {
                id: '2',
                title: 'Consultation Call',
                description: 'One-on-one consultation with an expert',
                startTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
                endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(),
                location: 'Zoom',
                type: 'meeting',
                url: 'https://zoom.us/j/123456789',
              },
              {
                id: '3',
                title: 'Advanced Workflows Webinar',
                description: 'Learn advanced techniques for workflow automation',
                startTime: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
                endTime: new Date(Date.now() + 432000000 + 5400000).toISOString(),
                type: 'webinar',
                attendees: 42,
              },
              {
                id: '4',
                title: 'Project Deadline',
                description: 'Final submission for automation project',
                startTime: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
                endTime: new Date(Date.now() + 604800000).toISOString(),
                type: 'deadline',
              },
            ])
          }, 500)
        }
      } catch (error) {
        logError('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [isAuthenticated, user])

  // Filter events based on the selected date
  const selectedDateEvents = events.filter(event => {
    const eventDate = new Date(event.startTime)
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    )
  })

  // Filter upcoming events (today and future)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startTime)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventDate >= today
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Get dates with events for highlighting in calendar
  const datesWithEvents = events.map(event => new Date(event.startTime))

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: locale !== 'ru'
    })
  }

  // Format date from ISO string
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  }

  // Get event type badge
  const getEventTypeBadge = (type: Event['type']) => {
    switch (type) {
      case 'course':
        return <Badge className="bg-blue-500">{t('eventTypes.course')}</Badge>
      case 'meeting':
        return <Badge className="bg-purple-500">{t('eventTypes.meeting')}</Badge>
      case 'webinar':
        return <Badge className="bg-green-500">{t('eventTypes.webinar')}</Badge>
      case 'deadline':
        return <Badge className="bg-red-500">{t('eventTypes.deadline')}</Badge>
      default:
        return <Badge>{t('eventTypes.other')}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notAuthenticated')}</CardTitle>
          <CardDescription>{t('notAuthenticatedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/calendar`)}`}>
            {t('loginButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('addEvent')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('calendar')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
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
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">{t('tabs.upcoming')}</TabsTrigger>
              <TabsTrigger value="selected">{t('tabs.selectedDate')}</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <h3 className="text-lg font-semibold">{t('upcomingEvents')}</h3>
              
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    {t('noUpcomingEvents')}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className={`h-1 ${
                        event.type === 'course' ? 'bg-blue-500' :
                        event.type === 'meeting' ? 'bg-purple-500' :
                        event.type === 'webinar' ? 'bg-green-500' :
                        event.type === 'deadline' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getEventTypeBadge(event.type)}
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {formatDate(event.startTime)}
                              </div>
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                              
                              {event.attendees && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Users className="mr-1 h-3 w-3" />
                                  {event.attendees} {t('attendees')}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {event.url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={event.url} target="_blank" rel="noopener noreferrer">
                                {t('join')}
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t('eventsFor')} {date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    {t('noEventsForSelectedDate')}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className={`h-1 ${
                        event.type === 'course' ? 'bg-blue-500' :
                        event.type === 'meeting' ? 'bg-purple-500' :
                        event.type === 'webinar' ? 'bg-green-500' :
                        event.type === 'deadline' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getEventTypeBadge(event.type)}
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                              
                              {event.attendees && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Users className="mr-1 h-3 w-3" />
                                  {event.attendees} {t('attendees')}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {event.url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={event.url} target="_blank" rel="noopener noreferrer">
                                {t('join')}
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
