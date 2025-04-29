import { getPayloadClient } from '@/utilities/payload/index'

interface GeoPoint {
  lat: number
  lon: number
}

interface GeoSearchResult {
  id: string
  distance: number
}

/**
 * Выполняет геопоиск по указанным координатам и радиусу
 * Формат входных данных: lat,lon,radius (например "55.7558,37.6173,10")
 */
export async function geoSearch(geoQuery: string): Promise<GeoSearchResult[]> {
  try {
    // Парсим параметры геопоиска
    const [latStr, lonStr, radiusStr] = geoQuery.split(',')

    if (!latStr || !lonStr || !radiusStr) {
      return []
    }

    const lat = parseFloat(latStr)
    const lon = parseFloat(lonStr)
    const radius = parseFloat(radiusStr)

    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
      return []
    }

    const payload = await getPayloadClient()

    // Получаем все точки с геоданными
    // В реальном приложении здесь должен быть более эффективный запрос
    // к специализированной геобазе данных или индексу
    const results = await payload.find({
      collection: 'locations', // Коллекция с геоданными
      limit: 100,
    })

    // Фильтруем результаты по расстоянию
    return results.docs
      .filter((doc) => doc.coordinates)
      .map((doc) => {
        const distance = calculateDistance(
          { lat, lon },
          { lat: doc.coordinates.lat, lon: doc.coordinates.lon },
        )

        return {
          id: doc.id,
          distance,
        }
      })
      .filter((result) => result.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
  } catch (error) {
    console.error('Geo search error:', error)
    return []
  }
}

/**
 * Рассчитывает расстояние между двумя точками по формуле гаверсинуса
 * Возвращает расстояние в километрах
 */
function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371 // Радиус Земли в км

  const dLat = degreesToRadians(point2.lat - point1.lat)
  const dLon = degreesToRadians(point2.lon - point1.lon)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(point1.lat)) *
      Math.cos(degreesToRadians(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Расстояние в км

  return distance
}

/**
 * Конвертирует градусы в радианы
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
