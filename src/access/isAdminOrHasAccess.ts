import { Access } from 'payload/config'
import { User } from '../payload-types'
import { checkRole } from './checkRole'

/**
 * Функция доступа, разрешающая действия пользователям с ролью admin или с доступом к определенной коллекции
 * @param collection Имя коллекции, для которой проверяется доступ
 * @returns Функция доступа, возвращающая true для администраторов или пользователей с доступом к указанной коллекции
 */
export const isAdminOrHasAccess =
  (collection: string): Access =>
  ({ req }) => {
    // Проверяем, авторизован ли пользователь
    if (!req.user) return false

    // Если пользователь admin, разрешаем доступ
    if (checkRole(['admin'], req.user as User)) return true

    // Проверяем наличие доступа к коллекции у пользователя
    if (req.user.access && Array.isArray(req.user.access)) {
      return req.user.access.some((access) => access.collection === collection)
    }

    return false
  }
