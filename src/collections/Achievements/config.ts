import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    description: 'Коллекция для хранения достижений/бейджей платформы.',
    defaultColumns: ['title', 'id', 'updatedAt'],
  },
  labels: {
    singular: 'Достижение',
    plural: 'Достижения',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название достижения',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание (как получить)',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Иконка достижения',
      required: true,
    },
    {
      name: 'rarity', // Дополнительное поле для геймификации
      type: 'select',
      label: 'Редкость',
      options: [
        { label: 'Обычное', value: 'common' },
        { label: 'Необычное', value: 'uncommon' },
        { label: 'Редкое', value: 'rare' },
        { label: 'Эпическое', value: 'epic' },
        { label: 'Легендарное', value: 'legendary' },
      ],
      defaultValue: 'common',
    },
    {
      name: 'pointsAwarded', // Если используется система баллов
      type: 'number',
      label: 'Баллы за достижение',
      min: 0,
    },
    // Можно добавить поля для условий получения, если логика сложная
    // Например, 'requiredAction', 'requiredValue' и т.д.
    // Но часто эта логика живет вне CMS.
  ],
}
