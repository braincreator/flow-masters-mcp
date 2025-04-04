import { isAdmin } from "./isAdmin"
import { Access } from "payload"

// Функция проверки доступа для админов или пользователей с доступом к сайту
export const isAdminOrHasSiteAccess: Access = ({ req }) => {
  // Проверка, является ли пользователь админом
  if (isAdmin({ req })) return true

  // Здесь можно добавить другие роли, которым разрешен доступ
  const { user } = req
  if (!user) return false

  // Проверяем роль пользователя (в зависимости от того, какие роли есть в вашей системе)
  // return Boolean(user.role === 'editor' || user.role === 'moderator')

  // Упрощенный вариант - только админы могут редактировать
  return false
}
