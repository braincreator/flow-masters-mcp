import { z } from 'zod'

export const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  query: z.string().optional(),
  sort: z.string().optional(),
  searchMode: z.enum(['basic', 'fulltext', 'field']).default('basic'),
  searchField: z.string().optional(),
  fields: z.string().transform(str => str.split(',')).optional(),
  exclude: z.string().transform(str => str.split(',')).optional(),
  status: z.enum(['draft', 'published']).default('published'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  locale: z.string().default('ru'),

  // Фильтрация по категориям
  categories: z.string().transform(str => str.split(',')).optional(),
  
  // Фильтрация по тегам
  tags: z.string().transform(str => str.split(',')).optional(),
  
  // Фильтрация по цене
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  
  // Фильтрация по рейтингу
  ratingMin: z.number().min(0).max(5).optional(),
  
  // Сортировка по нескольким полям
  sortFields: z.string().transform(str => 
    str.split(',').map(field => {
      const [name, order = 'asc'] = field.split(':')
      return { name, order }
    })
  ).optional(),
  
  // Группировка результатов
  groupBy: z.string().optional(),
  
  // Фасетный поиск
  facets: z.string().transform(str => str.split(',')).optional(),
  
  // Поиск похожих документов
  similar: z.string().optional(), // ID документа для поиска похожих
  
  // Нечеткий поиск
  fuzzy: z.boolean().default(false),
  fuzzyDistance: z.number().min(1).max(3).default(1),
  
  // Геопоиск
  near: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.number() // в километрах
  }).optional(),
  
  // Агрегации
  aggregations: z.string().transform(str => str.split(',')).optional(),
  
  // Форматирование результатов
  format: z.enum(['json', 'csv', 'xml']).default('json'),
  
  // Глубина поиска по связанным документам
  depth: z.number().min(0).max(3).default(1)
})
