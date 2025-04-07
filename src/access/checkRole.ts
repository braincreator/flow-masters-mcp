import { User } from '../payload-types'

/**
 * Проверяет, имеет ли пользователь одну из указанных ролей
 * @param roles Массив ролей для проверки
 * @param user Пользователь, чьи роли проверяются
 * @returns true, если у пользователя есть хотя бы одна из указанных ролей
 */
export const checkRole = (roles: string[], user?: User): boolean => {
  // Проверяем наличие пользователя
  if (!user) return false

  // Проверяем, если роль пользователя совпадает с одной из указанных
  if (user.role && roles.includes(user.role)) return true

  // Проверяем, если у пользователя есть массив ролей
  if (user.roles && Array.isArray(user.roles)) {
    return roles.some((role) => user.roles?.includes(role))
  }

  return false
}
