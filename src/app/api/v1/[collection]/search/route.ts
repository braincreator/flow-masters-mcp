import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { searchParamsSchema } from './validation'
import { buildAggregations } from './aggregations'
import { formatResults } from './formatters'
import { calculateSimilarity } from './similarity'
import { geoSearch } from './geo'
import { formatPriceAsync, getLocalePrice } from '@/utilities/formatPrice'

export async function GET(req: Request, { params }: { params: { collection: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const validatedParams = searchParamsSchema.parse(Object.fromEntries(searchParams))

    const payload = await getPayloadClient()

    // Базовый запрос
    let query: any = {
      collection: params.collection,
      depth: validatedParams.depth,
      page: validatedParams.page,
      limit: validatedParams.limit,
    }

    // Построение условий where
    const where: any = {}

    // Поиск по тексту с поддержкой нечеткого поиска
    if (validatedParams.query) {
      if (validatedParams.fuzzy) {
        where.or = [
          {
            title: {
              like: validatedParams.query,
              fuzzyDistance: validatedParams.fuzzyDistance,
            },
          },
          // другие поля для нечеткого поиска
        ]
      } else {
        where.or = [
          { title: { like: validatedParams.query } },
          // стандартный поиск по другим полям
        ]
      }
    }

    // Фильтрация по категориям
    if (validatedParams.categories) {
      where.categories = {
        in: validatedParams.categories,
      }
    }

    // Фильтрация по тегам
    if (validatedParams.tags) {
      where.tags = {
        all: validatedParams.tags,
      }
    }

    // Фильтрация по цене
    if (validatedParams.priceMin || validatedParams.priceMax) {
      where.price = {
        ...(validatedParams.priceMin && { gte: validatedParams.priceMin }),
        ...(validatedParams.priceMax && { lte: validatedParams.priceMax }),
      }
    }

    // Фильтрация по рейтингу
    if (validatedParams.ratingMin) {
      where.rating = {
        gte: validatedParams.ratingMin,
      }
    }

    // Геопоиск
    if (validatedParams.near) {
      const geoResults = await geoSearch(validatedParams.near)
      where.id = {
        in: geoResults.map((r) => r.id),
      }
    }

    // Сортировка по нескольким полям
    if (validatedParams.sortFields) {
      query.sort = validatedParams.sortFields.reduce(
        (acc, { name, order }) => ({
          ...acc,
          [name]: order,
        }),
        {},
      )
    }

    // Группировка
    if (validatedParams.groupBy) {
      query.group = validatedParams.groupBy
    }

    // Фасетный поиск
    if (validatedParams.facets) {
      query.facets = validatedParams.facets
    }

    // Поиск похожих документов
    if (validatedParams.similar) {
      const similarDocs = await calculateSimilarity(params.collection, validatedParams.similar)
      where.id = {
        in: similarDocs.map((d) => d.id),
      }
    }

    // Агрегации
    if (validatedParams.aggregations) {
      query.aggregations = buildAggregations(validatedParams.aggregations)
    }

    // Выполнение запроса
    const results = await payload.find({
      ...query,
      where,
    })

    // Форматирование результатов
    const formattedResults = await formatResults(results, validatedParams.format)

    // Возвращаем результаты в нужном формате
    return new NextResponse(formattedResults, {
      headers: {
        'Content-Type': getContentType(validatedParams.format),
        'X-Total-Count': String(results.totalDocs),
        'X-Total-Pages': String(results.totalPages),
      },
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

function getContentType(format: string): string {
  switch (format) {
    case 'csv':
      return 'text/csv'
    case 'xml':
      return 'application/xml'
    default:
      return 'application/json'
  }
}
