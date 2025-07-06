import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    // Получаем все пиксели
    const pixelsResponse = await payload.find({
      collection: 'pixels',
      limit: 1000 // Получаем все пиксели
    })

    const pixels = pixelsResponse.docs || []
    const results = {
      totalPixels: pixels.length,
      activatedPixels: 0,
      alreadyActivePixels: 0,
      errors: [] as string[],
      updatedPixels: [] as any[]
    }

    // Активируем все пиксели и настраиваем их для принудительной загрузки
    for (const pixel of pixels) {
      try {
        const updates: any = {}
        let needsUpdate = false

        // Активируем пиксель если он неактивен
        if (!pixel.isActive) {
          updates.isActive = true
          needsUpdate = true
        } else {
          results.alreadyActivePixels++
        }

        // Убираем GDPR ограничения для принудительной загрузки
        if (pixel.gdprCompliant) {
          updates.gdprCompliant = false
          needsUpdate = true
        }

        // Устанавливаем загрузку на всех страницах
        if (!pixel.pages || !pixel.pages.includes('all')) {
          updates.pages = ['all']
          needsUpdate = true
        }

        // Устанавливаем высокий приоритет загрузки
        if (pixel.loadPriority !== 'high') {
          updates.loadPriority = 'high'
          needsUpdate = true
        }

        if (needsUpdate) {
          const updatedPixel = await payload.update({
            collection: 'pixels',
            id: pixel.id,
            data: updates
          })

          results.activatedPixels++
          results.updatedPixels.push({
            id: pixel.id,
            name: pixel.name,
            type: pixel.type,
            changes: updates
          })
        }

      } catch (error) {
        results.errors.push(`Failed to update pixel ${pixel.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `🚀 FORCE MODE ACTIVATED! ${results.activatedPixels} pixels updated, ${results.alreadyActivePixels} were already active`,
      results,
      instructions: {
        environmentVariable: 'Add NEXT_PUBLIC_FORCE_LOAD_PIXELS=true to your .env.local file',
        restart: 'Restart your development server after adding the environment variable',
        verification: 'Check /en/test/analytics to verify all pixels are loading'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to activate pixels',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    // Получаем статистику пикселей
    const pixelsResponse = await payload.find({
      collection: 'pixels',
      limit: 1000
    })

    const pixels = pixelsResponse.docs || []
    const stats = {
      total: pixels.length,
      active: pixels.filter((p: any) => p.isActive).length,
      inactive: pixels.filter((p: any) => !p.isActive).length,
      gdprCompliant: pixels.filter((p: any) => p.gdprCompliant).length,
      allPages: pixels.filter((p: any) => p.pages && p.pages.includes('all')).length,
      highPriority: pixels.filter((p: any) => p.loadPriority === 'high').length,
      forceMode: process.env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true'
    }

    const readyForForceMode = pixels.filter((p: any) => 
      p.isActive && 
      !p.gdprCompliant && 
      p.pages && 
      p.pages.includes('all') && 
      p.loadPriority === 'high'
    ).length

    return NextResponse.json({
      stats,
      readyForForceMode,
      recommendations: [
        stats.inactive > 0 ? `${stats.inactive} pixels are inactive and need activation` : null,
        stats.gdprCompliant > 0 ? `${stats.gdprCompliant} pixels have GDPR restrictions` : null,
        (stats.total - stats.allPages) > 0 ? `${stats.total - stats.allPages} pixels are not set for all pages` : null,
        (stats.total - stats.highPriority) > 0 ? `${stats.total - stats.highPriority} pixels don't have high priority` : null,
        !stats.forceMode ? 'NEXT_PUBLIC_FORCE_LOAD_PIXELS environment variable is not set' : null
      ].filter(Boolean),
      isFullyOptimized: readyForForceMode === stats.total && stats.forceMode
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get pixel stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
