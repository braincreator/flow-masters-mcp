import { isAdmin } from '@/access/isAdmin'
import { CollectionConfig } from 'payload'
import { ServiceRegistry } from '@/services/service.registry'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'author', 'post', 'status', 'createdAt'],
  },
  access: {
    read: () => true, // Anyone can read comments
    create: () => true, // Anyone can create comments
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      minLength: 5,
    },
    {
      name: 'author',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'website',
          type: 'text',
          admin: {
            description: 'Optional website URL',
          },
        },
      ],
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      hasMany: false,
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      hasMany: false,
      admin: {
        description: 'Optional parent comment for replies',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий комментариев
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания комментария
          await eventService.publishEvent('comment.created', {
            id: doc.id,
            content: doc.content,
            author: doc.author,
            post: typeof doc.post === 'object' ? doc.post.id : doc.post,
            postTitle: typeof doc.post === 'object' ? doc.post.title : null,
            parentComment: typeof doc.parentComment === 'object' ? doc.parentComment.id : doc.parentComment,
            status: doc.status,
            isReply: !!doc.parentComment,
            createdAt: doc.createdAt,
          }, {
            source: 'comment_creation',
            collection: 'comments',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие одобрения комментария
          if (doc.status === 'approved' && previousDoc.status !== 'approved') {
            await eventService.publishEvent('comment.approved', {
              id: doc.id,
              content: doc.content,
              author: doc.author,
              post: typeof doc.post === 'object' ? doc.post.id : doc.post,
              postTitle: typeof doc.post === 'object' ? doc.post.title : null,
              parentComment: typeof doc.parentComment === 'object' ? doc.parentComment.id : doc.parentComment,
              previousStatus: previousDoc.status,
              approvedAt: new Date().toISOString(),
              isReply: !!doc.parentComment,
            }, {
              source: 'comment_approval',
              collection: 'comments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие отклонения комментария
          if (doc.status === 'rejected' && previousDoc.status !== 'rejected') {
            await eventService.publishEvent('comment.rejected', {
              id: doc.id,
              content: doc.content,
              author: doc.author,
              post: typeof doc.post === 'object' ? doc.post.id : doc.post,
              postTitle: typeof doc.post === 'object' ? doc.post.title : null,
              parentComment: typeof doc.parentComment === 'object' ? doc.parentComment.id : doc.parentComment,
              previousStatus: previousDoc.status,
              rejectedAt: new Date().toISOString(),
              isReply: !!doc.parentComment,
            }, {
              source: 'comment_rejection',
              collection: 'comments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие получения лайков (если лайков стало больше)
          if (doc.likes > (previousDoc.likes || 0)) {
            await eventService.publishEvent('comment.liked', {
              id: doc.id,
              content: doc.content,
              author: doc.author,
              post: typeof doc.post === 'object' ? doc.post.id : doc.post,
              postTitle: typeof doc.post === 'object' ? doc.post.title : null,
              previousLikes: previousDoc.likes || 0,
              newLikes: doc.likes,
              likesIncrease: doc.likes - (previousDoc.likes || 0),
            }, {
              source: 'comment_liked',
              collection: 'comments',
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