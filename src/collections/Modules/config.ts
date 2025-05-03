import type { CollectionConfig } from 'payload'

// Removed group import as it's used directly

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    useAsTitle: 'name',
    group: 'Управление Обучением', // Using string literal like in Courses
    defaultColumns: ['name', 'course', 'updatedAt'],
  },
  access: {
    read: () => true, // Adjust access control as needed
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название модуля',
    },
    {
      name: 'description',
      type: 'textarea', // Using textarea for simplicity, can be richText if needed
      label: 'Описание модуля',
    },
    {
      name: 'lessons',
      type: 'relationship',
      relationTo: 'lessons',
      hasMany: true,
      label: 'Уроки',
      // Optional: Add admin configuration for inline editing or display
      // admin: {
      //   allowCreate: true,
      // },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Курс',
      // This field establishes the link back to the course.
      // It's often managed implicitly when adding modules within a course document.
      admin: {
        readOnly: true, // Prevent editing from the Module side directly
        position: 'sidebar',
      },
      // Automatically populate this when a module is created/saved within a course context
      // hooks: {
      //   beforeChange: [/* hook to set course based on context if needed */],
      // },
      index: true, // Index for faster lookups
    },
  ],
}
