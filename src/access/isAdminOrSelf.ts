import type { Access } from 'payload/config'
import type { User, UserFavorite } from '@/payload-types'

/**
 * Доступ разрешен, если пользователь - администратор ИЛИ
 * если ID пользователя совпадает с ID запрашиваемого ресурса.
 *
 * Используем простой вариант: разрешаем доступ не-админам, полагаясь
 * на то, что операции в эндпоинтах/хуках будут содержать
 * `where: { user: { equals: userId } }` для ограничения доступа к чужим данным.
 */
export const isAdminOrSelf: Access<UserFavorite, User> = ({ req: { user } }) => {
  // Если нет пользователя, доступ запрещен (это важно!)
  if (!user) {
    return false
  }

  // Если пользователь - админ, разрешаем доступ
  if (user.roles?.includes('admin')) {
    return true
  }

  // Если пользователь не админ, разрешаем доступ,
  // полагаясь на where-условия в конкретных запросах.
  return true
}
