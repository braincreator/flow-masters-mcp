import { CollectionConfig, Access } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '@/access/authenticated'

// Функция доступа для проверки является ли пользователь заказчиком проекта или администратором
const isAdminOrProjectCustomer: Access = ({ req: { user } }) => {
  if (!user) return false

  // Администраторы имеют полный доступ
  if (user.roles?.includes('admin')) return true

  // Для запросов на создание/обновление/удаление доступ имеют только заказчики к своим проектам
  return {
    customer: {
      equals: user.id,
    },
  }
}

const ServiceProjects: CollectionConfig = {
  slug: 'service-projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sourceOrder', 'customer', 'status', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdmin,
    read: isAdminOrProjectCustomer,
    update: isAdminOrProjectCustomer,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Название проекта',
      },
    },
    {
      name: 'sourceOrder',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      admin: {
        description: 'Исходный заказ',
        readOnly: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Заказчик',
        readOnly: true,
      },
    },
    {
      name: 'serviceDetails',
      type: 'group',
      admin: {
        description: 'Детали заказанной услуги',
        readOnly: true,
      },
      fields: [
        {
          name: 'serviceName',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'serviceType',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'specificationText',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Текстовое ТЗ',
        readOnly: true,
      },
    },
    {
      name: 'specificationFiles',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Файлы ТЗ',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Новый', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'На проверке', value: 'on_review' },
        { label: 'Завершен', value: 'completed' },
        { label: 'Отменен', value: 'cancelled' },
      ],
      defaultValue: 'new',
      required: true,
      localized: true,
      admin: {
        description: 'Статус выполнения проекта',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Исполнитель',
        condition: () => true, // Всегда отображается, но редактировать могут только администраторы
      },
      access: {
        update: () => false, // Только в админке через стандартный контроль доступа
      },
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Внутренние заметки по проекту',
      },
    },
    {
      name: 'appliedTemplate',
      type: 'relationship',
      relationTo: 'project-templates',
      admin: {
        description: 'Примененный шаблон проекта',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

export default ServiceProjects
