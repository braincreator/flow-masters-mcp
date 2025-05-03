import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical' // Assuming lexical is configured

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    group: 'Управление Обучением', // Using string literal
    defaultColumns: ['title', 'module', 'updatedAt'],
    preview: (doc) => {
      // Basic preview URL structure, adjust as needed for your frontend routing
      if (doc?.slug) {
        return `/lessons/${doc.slug}`
      }
      return null
    },
  },
  versions: {
    drafts: true, // Enable drafts for lessons
  },
  access: {
    read: () => true, // Adjust access control as needed
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Название урока',
      localized: true, // Assuming lesson titles might need translation
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Содержание урока',
      editor: lexicalEditor({}), // Using lexical editor
      localized: true,
    },
    {
      name: 'videoUrl',
      type: 'text', // Using text for flexibility as requested
      label: 'Ссылка на видео (необязательно)',
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
      required: true,
      label: 'Модуль',
      // This field links the lesson back to its module.
      // Managed implicitly when adding lessons within a module.
      admin: {
        readOnly: true, // Prevent editing from the Lesson side directly
        position: 'sidebar',
      },
      // hooks: {
      //   beforeChange: [/* hook to set module based on context if needed */],
      // },
      index: true, // Index for faster lookups
    },
    // Optional: Add fields like estimated duration, resources, etc. later
  ],
}
