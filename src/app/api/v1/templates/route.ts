import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const isPublic = url.searchParams.get('isPublic')
    
    const payload = await getPayloadClient()
    
    // Формируем запрос с фильтрами
    const query: any = {}
    
    if (type) {
      query.type = {
        equals: type
      }
    }
    
    if (isPublic) {
      query.isPublic = {
        equals: isPublic === 'true'
      }
    }
    
    // Получаем шаблоны
    const templates = await payload.find({
      collection: 'templates',
      where: Object.keys(query).length > 0 ? query : undefined,
      sort: '-createdAt',
    })
    
    return NextResponse.json({
      success: true,
      data: templates.docs,
      totalDocs: templates.totalDocs,
      totalPages: templates.totalPages,
      page: templates.page,
    })
    
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()
    const body = await req.json()
    
    // Создаем новый шаблон
    const template = await payload.create({
      collection: 'templates',
      data: body,
    })
    
    return NextResponse.json({
      success: true,
      data: template,
    })
    
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
