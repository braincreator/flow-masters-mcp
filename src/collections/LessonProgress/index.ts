import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { ServiceRegistry } from '@/services/service.registry'

export const LessonProgress: CollectionConfig = {
  slug: 'lesson-progress',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'lesson', 'course', 'status', 'completedAt'],
    group: 'Learning Management',
    description: 'Tracking user progress through lessons',
  },
  access: {
    create: isAdminOrSelf,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who viewed the lesson',
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      admin: {
        description: 'The lesson that was viewed',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'The course the lesson belongs to',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'in_progress',
      options: [
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the lesson progress',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the lesson was completed',
        condition: (data) => data.status === 'completed',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the lesson was last accessed',
      },
    },
    {
      name: 'timeSpent',
      type: 'number',
      min: 0,
      admin: {
        description: 'Time spent on the lesson in seconds',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the lesson progress',
      },
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий прогресса уроков
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие начала урока
          await eventService.publishEvent('lesson.started', {
            id: doc.id,
            lesson: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
            lessonTitle: typeof doc.lesson === 'object' ? doc.lesson.title : null,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            userName: typeof doc.user === 'object' ? doc.user.name : null,
            userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            progress: doc.progress,
            startedAt: doc.startedAt,
          }, {
            source: 'lesson_start',
            collection: 'lesson-progress',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие завершения урока
          if (doc.isCompleted && !previousDoc.isCompleted) {
            await eventService.publishEvent('lesson.completed', {
              id: doc.id,
              lesson: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
              lessonTitle: typeof doc.lesson === 'object' ? doc.lesson.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              progress: doc.progress,
              startedAt: doc.startedAt,
              completedAt: doc.completedAt,
              timeSpent: doc.timeSpent,
              duration: doc.startedAt && doc.completedAt ?
                Math.round((new Date(doc.completedAt).getTime() - new Date(doc.startedAt).getTime()) / (1000 * 60)) : null,
            }, {
              source: 'lesson_completion',
              collection: 'lesson-progress',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие обновления прогресса урока
          if (doc.progress !== previousDoc.progress) {
            await eventService.publishEvent('lesson.progress_updated', {
              id: doc.id,
              lesson: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
              lessonTitle: typeof doc.lesson === 'object' ? doc.lesson.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              previousProgress: previousDoc.progress,
              newProgress: doc.progress,
              progressIncrease: doc.progress - previousDoc.progress,
              timeSpent: doc.timeSpent,
            }, {
              source: 'lesson_progress_update',
              collection: 'lesson-progress',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие "застрял на уроке" (если не было активности 3+ дня)
          const daysSinceLastAccess = doc.lastAccessedAt ?
            Math.floor((Date.now() - new Date(doc.lastAccessedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0

          if (daysSinceLastAccess >= 3 && !doc.isCompleted && doc.progress < 100) {
            await eventService.publishEvent('lesson.stuck', {
              id: doc.id,
              lesson: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
              lessonTitle: typeof doc.lesson === 'object' ? doc.lesson.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              progress: doc.progress,
              daysSinceLastAccess,
              lastAccessedAt: doc.lastAccessedAt,
            }, {
              source: 'lesson_stuck',
              collection: 'lesson-progress',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
  timestamps: true,
}
