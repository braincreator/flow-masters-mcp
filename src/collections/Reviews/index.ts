import type { CollectionConfig, Access } from 'payload'; // Import CollectionConfig and Access from 'payload'
// Remove problematic import: import type { BeforeChangeHook } from 'payload/types';
import { getPayloadClient } from '@/utilities/payload/index'; // Correct import path for getPayloadClient
import type { User, Review, Course } from '@/payload-types'; // Import necessary types
import { ServiceRegistry } from '@/services/service.registry'

// Define reusable access control function for owner or admin
const ownerOrAdmin: Access = async ({ req, id }: { req: { user?: User | null }, id?: string | number }) => {
  const user = req.user; // Extract user from req
  if (!user) return false; // Not logged in
  if (user.roles?.includes('admin')) return true; // Admin has access

  if (!id) {
    return false; // Cannot check ownership without ID
  }

  try {
    const payload = await getPayloadClient();
    // Fetch with depth 0 initially to check the user ID field directly
    const review = await payload.findByID({
      collection: 'reviews',
      id: id,
      depth: 0, // Fetch only the ID fields first
      user,
    });

    if (!review) return false; // Review not found

    // Check the user ID field directly (should be string | number)
    const ownerId = review.user; // user field is just the ID at depth 0
    return user.id === ownerId;
  } catch (error) {
    console.error(`Error checking review ownership for ID ${id}:`, error);
    return false;
  }
};

// Hook to set user on creation
// Remove BeforeChangeHook type annotation
const setUserBeforeChange = ({ req, operation, data }: { req: { user?: User | null }, operation: 'create' | 'update', data: Partial<Review> }) => {
  if (operation === 'create' && req.user) {
    // Set the user field during creation
    data.user = req.user.id;
  }
  return data;
};


export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Review',
    plural: 'Reviews',
  },
  admin: {
    useAsTitle: 'id', // Use ID or potentially user name after population
    defaultColumns: ['rating', 'user', 'course', 'createdAt'],
    preview: (doc: Partial<Review & { course?: Course | string }>) => { // Add type for doc
        // Handle populated vs unpopulated course
        const courseSlugOrId = typeof doc?.course === 'object' && doc.course !== null ? doc.course.slug : doc?.course;
        // Ensure PAYLOAD_PUBLIC_SERVER_URL is defined and fallback if not
        const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || '';
        return `${baseUrl}/courses/${courseSlugOrId ?? ''}?preview=true`;
    },
  },
  access: {
    // Define access controls as needed
    create: ({ req: { user } }: { req: { user?: User | null } }) => !!user, // Type user arg
    read: () => true, // Allow public read access
    update: ownerOrAdmin, // Use the reusable function
    delete: ownerOrAdmin, // Use the reusable function
  },
  fields: [
    {
      name: 'course', // Link to the course being reviewed
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      index: true, // Add index for faster querying
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'user', // Link to the user who wrote the review
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // Set defaultValue in a hook instead for reliability
      admin: {
        position: 'sidebar',
        readOnly: true, // Prevent changing the user in admin UI after creation
        condition: (data: Partial<Review>) => Boolean(data?.id), // Type data, Only make readOnly for existing docs
      },
      index: true,
    },
    {
      name: 'rating', // Star rating
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      admin: {
        step: 0.5,
      }
    },
    {
      name: 'comment', // The review text
      type: 'textarea',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      setUserBeforeChange, // Use the typed hook function
    ],
    afterChange: [
      // Добавляем хук для событий отзывов
      async ({ doc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Определяем тип отзыва по рейтингу
          const isPositive = doc.rating >= 4
          const isNegative = doc.rating <= 2

          // Событие создания отзыва
          await eventService.publishEvent('review.created', {
            id: doc.id,
            rating: doc.rating,
            comment: doc.comment,
            course: typeof doc.course === 'object' ? doc.course.id : doc.course,
            courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            userName: typeof doc.user === 'object' ? doc.user.name : null,
            userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            isPositive,
            isNegative,
            createdAt: doc.createdAt,
          }, {
            source: 'review_creation',
            collection: 'reviews',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })

          // Событие позитивного отзыва
          if (isPositive) {
            await eventService.publishEvent('review.positive', {
              id: doc.id,
              rating: doc.rating,
              comment: doc.comment,
              course: typeof doc.course === 'object' ? doc.course.id : doc.course,
              courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            }, {
              source: 'positive_review',
              collection: 'reviews',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие негативного отзыва (требует внимания)
          if (isNegative) {
            await eventService.publishEvent('review.negative', {
              id: doc.id,
              rating: doc.rating,
              comment: doc.comment,
              course: typeof doc.course === 'object' ? doc.course.id : doc.course,
              courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            }, {
              source: 'negative_review',
              collection: 'reviews',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
};