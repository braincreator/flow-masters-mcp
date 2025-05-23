import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'
import {
  CalendarEvent,
  processMilestoneEvents,
  processTaskEvents,
  processProjectEvents,
  groupEventsByDate,
  getEventsForDate,
  hasEventsOnDate,
  getEventStyleClasses,
  formatEventTooltip,
} from '@/utilities/calendarEvents'
import { formatDate } from '@/utilities/formatDate'

// Types
interface MilestoneItem {
  id: string
  title: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  startDate?: string
  dueDate?: string
  completionDate?: string
  progress?: number
}

interface TaskItem {
  id: string
  title: string
  description?: string
  status: 'new' | 'in_progress' | 'completed'
  dueDate?: string
  completionDate?: string
  createdAt: string
  updatedAt: string
}

interface ProjectDetails {
  id: string
  name: string
}

interface CalendarTabContentProps {
  milestones: MilestoneItem[]
  tasks: TaskItem[]
  isLoadingCalendarData: boolean
  project: ProjectDetails
  lang: string
  t: (key: string, params?: any) => string
}

const CalendarTabContent: React.FC<CalendarTabContentProps> = (props) => {
  const { milestones, tasks, isLoadingCalendarData, project, lang, t } = props

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Process all events from milestones, tasks, and project
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = []

    // Process milestone events
    if (milestones && milestones.length > 0) {
      events.push(...processMilestoneEvents(milestones))
    }

    // Process task events
    if (tasks && tasks.length > 0) {
      events.push(...processTaskEvents(tasks))
    }

    // Process project events
    if (project) {
      events.push(
        ...processProjectEvents({
          id: project.id,
          name: project.name,
          createdAt: new Date().toISOString(), // Fallback if not available
          updatedAt: new Date().toISOString(), // Fallback if not available
          status: 'active',
        }),
      )
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [milestones, tasks, project])

  // Group events by date for easy lookup
  const eventsByDate = useMemo(() => groupEventsByDate(allEvents), [allEvents])

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    return getEventsForDate(allEvents, selectedDate)
  }, [allEvents, selectedDate])

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('calendarTab.title')}
        </h3>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date()
              setSelectedDate(today)
              setCurrentMonth(today)
            }}
          >
            {t('calendarTab.today')}
          </Button>
        </div>
      </div>

      {isLoadingCalendarData ? (
        <div className="flex justify-center items-center py-20">
          <AnimatedLoadingIndicator size="medium" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border"
                  modifiers={{
                    hasEvents: (date) => hasEventsOnDate(allEvents, date),
                    hasOverdueEvents: (date) => {
                      const dayEvents = getEventsForDate(allEvents, date)
                      return dayEvents.some((event) => event.isOverdue)
                    },
                    hasPlannedEvents: (date) => {
                      const dayEvents = getEventsForDate(allEvents, date)
                      return dayEvents.some((event) => event.isPlanned && !event.isOverdue)
                    },
                    hasActualEvents: (date) => {
                      const dayEvents = getEventsForDate(allEvents, date)
                      return dayEvents.some((event) => !event.isPlanned && !event.isOverdue)
                    },
                  }}
                  modifiersClassNames={{
                    hasEvents: 'relative',
                    hasOverdueEvents: 'bg-red-50 text-red-900 font-semibold',
                    hasPlannedEvents: 'bg-blue-50 text-blue-900',
                    hasActualEvents: 'bg-green-50 text-green-900 font-medium',
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Event Details and Legend */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate
                    ? formatDate(selectedDate.toISOString(), lang)
                    : t('calendarTab.noEvents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${getEventStyleClasses(event)}`}
                        title={formatEventTooltip(event, t, lang)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t(
                                `calendarTab.events.${event.type}${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}`,
                              )}
                            </p>
                          </div>
                          <Badge
                            variant={
                              event.isOverdue
                                ? 'destructive'
                                : event.isPlanned
                                  ? 'outline'
                                  : 'default'
                            }
                            className="ml-2 text-xs"
                          >
                            {event.isOverdue
                              ? t('calendarTab.eventTypes.overdue')
                              : event.isPlanned
                                ? t('calendarTab.eventTypes.planned')
                                : t('calendarTab.eventTypes.actual')}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {selectedDate ? t('calendarTab.noEvents') : t('calendarTab.loading')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('calendarTab.legend.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">
                    {t('calendarTab.legend.plannedEvents')} - {t('calendarTab.legend.milestones')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">
                    {t('calendarTab.legend.plannedEvents')} - {t('calendarTab.legend.tasks')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">
                    {t('calendarTab.legend.actualEvents')} - {t('calendarTab.legend.milestones')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-sm">
                    {t('calendarTab.legend.actualEvents')} - {t('calendarTab.legend.tasks')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">{t('calendarTab.legend.overdueEvents')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{milestones.length}</p>
                    <p className="text-sm text-gray-600">{t('calendarTab.milestoneCount')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                    <p className="text-sm text-gray-600">{t('calendarTab.taskCount')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default CalendarTabContent
