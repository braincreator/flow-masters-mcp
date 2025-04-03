import { CollectionConfig } from 'payload'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { User } from '@/payload-types'

export const UserFavorites: CollectionConfig = {
  slug: 'user-favorites',
  admin: {
    useAsTitle: 'user', // Показываем пользователя в заголовке, но нужно настроить отображение
    defaultColumns: ['user', 'products'],
    group: 'Users',
    description: 'Manages user favorite products.',
  },
  access: {
    create: isAdminOrSelf,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdminOrSelf,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true, // Возвращаем требование обязательного поля
      unique: true, // Один пользователь - одна запись избранного
      // Не позволяем изменять пользователя после создания
      access: {
        create: () => true,
        update: () => false,
      },
      admin: {
        readOnly: true, // Нельзя изменить в админке
        position: 'sidebar',
        description: 'The user these favorites belong to.',
      },
      // Хук для автоматического заполнения пользователя при создании
      // hooks: { // Оставляем хук закомментированным
      //   beforeChange: [
      //     ({ req, operation, data }) => {
      //       if (operation === 'create' && req.user) {
      //         // Если создаем запись и пользователь авторизован,
      //         // устанавливаем текущего пользователя
      //         return { ...data, user: (req.user as User).id }
      //       }
      //       // В остальных случаях (update или нет user) возвращаем как есть
      //       // При обновлении поле user не должно меняться (см. access.update выше)
      //       return data
      //     },
      //   ],
      // },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'List of favorite products for this user.',
      },
    },
  ],
  timestamps: true, // Добавляем createdAt и updatedAt
}

export default UserFavorites
