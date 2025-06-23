import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { ServiceRegistry } from '@/services/service.registry'

export const UserAchievements: CollectionConfig = {
  slug: 'user-achievements',
  admin: {
    useAsTitle: 'id', // TODO: Consider hook/component for better title (User - Achievement)
    listSearchableFields: ['user', 'achievement'],
    defaultColumns: ['user', 'achievement', 'awardedAt', 'status'],
    group: 'Learning Management',
    description: 'User achievements tracking',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
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
        description: 'User who earned the achievement',
      },
    },
    {
      name: 'achievement',
      type: 'relationship',
      relationTo: 'achievements',
      required: true,
      admin: {
        description: 'The achievement earned by the user',
      },
    },
    {
      name: 'awardedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the achievement was awarded',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the achievement',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the achievement',
        hidden: true, // Hide raw JSON from admin UI
      },
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий достижений
      async ({ doc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие получения достижения
          await eventService.publishEvent('achievement.earned', {
            id: doc.id,
            achievement: typeof doc.achievement === 'object' ? doc.achievement.id : doc.achievement,
            achievementTitle: typeof doc.achievement === 'object' ? doc.achievement.title : null,
            achievementDescription: typeof doc.achievement === 'object' ? doc.achievement.description : null,
            achievementType: typeof doc.achievement === 'object' ? doc.achievement.type : null,
            achievementPoints: typeof doc.achievement === 'object' ? doc.achievement.points : null,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            userName: typeof doc.user === 'object' ? doc.user.name : null,
            userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            earnedAt: doc.earnedAt,
            metadata: doc.metadata,
          }, {
            source: 'achievement_earned',
            collection: 'user-achievements',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })

          // Событие важной вехи (если это milestone достижение)
          if (typeof doc.achievement === 'object' && doc.achievement.type === 'milestone') {
            await eventService.publishEvent('achievement.milestone', {
              id: doc.id,
              achievement: doc.achievement.id,
              achievementTitle: doc.achievement.title,
              achievementDescription: doc.achievement.description,
              achievementPoints: doc.achievement.points,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              earnedAt: doc.earnedAt,
              metadata: doc.metadata,
            }, {
              source: 'achievement_milestone',
              collection: 'user-achievements',
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
