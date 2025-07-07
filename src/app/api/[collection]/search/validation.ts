import { z } from 'zod'

// Схема валидации параметров поиска
export const searchParamsSchema = z.object({
  // Основные параметры
  query: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  depth: z.coerce.number().min(0).max(3).default(0),

  // Параметры нечеткого поиска
  fuzzy: z.coerce.boolean().default(false),
  fuzzyDistance: z.coerce.number().min(1).max(5).default(2),

  // Фильтры
  categories: z
    .array(z.string())
    .or(z.string().transform((s) => [s]))
    .optional(),
  tags: z
    .array(z.string())
    .or(z.string().transform((s) => [s]))
    .optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  ratingMin: z.coerce.number().min(0).max(5).optional(),

  // Геопоиск
  near: z.string().optional(), // Формат: lat,lon,radius

  // Сортировка
  sort: z
    .string()
    .optional()
    .transform((sortString) => {
      if (!sortString) return undefined

      const sortFields = sortString.split(',').map((field) => {
        if (field.startsWith('-')) {
          return { name: field.substring(1), order: 'desc' }
        }
        return { name: field, order: 'asc' }
      })

      return sortFields
    }),
  sortFields: z
    .array(
      z.object({
        name: z.string(),
        order: z.enum(['asc', 'desc']).default('asc'),
      }),
    )
    .optional(),

  // Группировка и агрегации
  groupBy: z.string().optional(),
  facets: z
    .array(z.string())
    .or(z.string().transform((s) => [s]))
    .optional(),
  aggregations: z
    .array(z.string())
    .or(z.string().transform((s) => [s]))
    .optional(),

  // Поиск похожих
  similar: z.string().optional(),

  // Формат вывода
  format: z.enum(['json', 'csv', 'xml']).default('json'),
})
