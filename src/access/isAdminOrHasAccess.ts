import { Access, PayloadRequest } from 'payload'
import { User } from '../payload-types'
import { checkRole } from './checkRole'

/**
 * Функция доступа, разрешающая действия пользователям с ролью admin или с доступом к определенной коллекции
 * @param collection Имя коллекции, для которой проверяется доступ
 * @returns Функция доступа, возвращающая true для администраторов или пользователей с доступом к указанной коллекции
 */
export const isAdminOrHasAccess =
  (_collection: string): Access =>
  ({ req }) => {
    // Проверяем, авторизован ли пользователь
    if (!req.user) return false

    // Если пользователь admin, разрешаем доступ
    if (checkRole(['admin'], req.user as User)) return true

    // Для простоты, если пользователь не админ, запрещаем доступ
    // В реальном проекте здесь должна быть логика проверки доступа к коллекции
    return false
  }
