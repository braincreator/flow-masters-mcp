/**
 * Утилиты для работы с незавершенными бронированиями
 * для неавторизованных пользователей
 */

// Ключ для хранения информации о незавершенных бронированиях
const PENDING_BOOKINGS_KEY = 'flow_masters_pending_bookings'

// Интерфейс для хранения информации о незавершенном бронировании
interface PendingBookingInfo {
  orderId: string
  serviceId: string
  timestamp: number
  email: string
  completed: boolean
}

/**
 * Сохраняет информацию о незавершенном бронировании
 */
export const savePendingBooking = (
  orderId: string,
  serviceId: string,
  email: string
): void => {
  try {
    // Получаем текущие незавершенные бронирования
    const pendingBookings = getPendingBookings()
    
    // Добавляем новое бронирование
    pendingBookings.push({
      orderId,
      serviceId,
      timestamp: Date.now(),
      email,
      completed: false,
    })
    
    // Сохраняем обновленный список
    localStorage.setItem(PENDING_BOOKINGS_KEY, JSON.stringify(pendingBookings))
  } catch (error) {
    console.error('Error saving pending booking:', error)
  }
}

/**
 * Получает список незавершенных бронирований
 */
export const getPendingBookings = (): PendingBookingInfo[] => {
  try {
    const pendingBookingsJson = localStorage.getItem(PENDING_BOOKINGS_KEY)
    
    if (!pendingBookingsJson) {
      return []
    }
    
    return JSON.parse(pendingBookingsJson)
  } catch (error) {
    console.error('Error getting pending bookings:', error)
    return []
  }
}

/**
 * Помечает бронирование как завершенное
 */
export const markBookingAsCompleted = (orderId: string): void => {
  try {
    // Получаем текущие незавершенные бронирования
    const pendingBookings = getPendingBookings()
    
    // Находим бронирование по orderId и помечаем его как завершенное
    const updatedBookings = pendingBookings.map((booking) => {
      if (booking.orderId === orderId) {
        return { ...booking, completed: true }
      }
      return booking
    })
    
    // Сохраняем обновленный список
    localStorage.setItem(PENDING_BOOKINGS_KEY, JSON.stringify(updatedBookings))
  } catch (error) {
    console.error('Error marking booking as completed:', error)
  }
}

/**
 * Удаляет бронирование из списка
 */
export const removePendingBooking = (orderId: string): void => {
  try {
    // Получаем текущие незавершенные бронирования
    const pendingBookings = getPendingBookings()
    
    // Удаляем бронирование по orderId
    const updatedBookings = pendingBookings.filter(
      (booking) => booking.orderId !== orderId
    )
    
    // Сохраняем обновленный список
    localStorage.setItem(PENDING_BOOKINGS_KEY, JSON.stringify(updatedBookings))
  } catch (error) {
    console.error('Error removing pending booking:', error)
  }
}

/**
 * Получает незавершенные бронирования (не старше 30 дней)
 */
export const getActivePendingBookings = (): PendingBookingInfo[] => {
  try {
    // Получаем все незавершенные бронирования
    const allBookings = getPendingBookings()
    
    // Фильтруем бронирования:
    // - Не завершенные
    // - Не старше 30 дней
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    
    return allBookings.filter(
      (booking) => !booking.completed && booking.timestamp > thirtyDaysAgo
    )
  } catch (error) {
    console.error('Error getting active pending bookings:', error)
    return []
  }
}

/**
 * Очищает старые бронирования (старше 30 дней)
 */
export const cleanupOldBookings = (): void => {
  try {
    // Получаем все незавершенные бронирования
    const allBookings = getPendingBookings()
    
    // Фильтруем бронирования, оставляя только те, которые не старше 30 дней
    // или которые помечены как завершенные не более 7 дней назад
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    
    const updatedBookings = allBookings.filter(
      (booking) => 
        (booking.timestamp > thirtyDaysAgo) || 
        (booking.completed && booking.timestamp > sevenDaysAgo)
    )
    
    // Сохраняем обновленный список
    localStorage.setItem(PENDING_BOOKINGS_KEY, JSON.stringify(updatedBookings))
  } catch (error) {
    console.error('Error cleaning up old bookings:', error)
  }
}
