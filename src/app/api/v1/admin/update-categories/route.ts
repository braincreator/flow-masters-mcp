import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { isAdmin } from '@/access/isAdmin'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Ensure the user is authorized
    const { user } = payload.req

    if (!user || !isAdmin({ req: payload.req })) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract category updates
    const { categories } = await request.json()

    if (!categories || typeof categories !== 'object') {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Process updates
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each category update
    for (const [categoryId, categoryType] of Object.entries(categories)) {
      try {
        // Skip placeholder values like 'none' or 'select-type'
        if (categoryType === 'none' || categoryType === 'select-type') {
          continue
        }

        // Validate the category type
        const validTypes = ['product', 'blog', 'general']
        if (!validTypes.includes(categoryType as string)) {
          results.failed++
          results.errors.push(`Invalid category type for ID ${categoryId}: ${categoryType}`)
          continue
        }

        await payload.update({
          collection: 'categories',
          id: categoryId,
          data: {
            categoryType,
          },
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(
          `Failed to update category ${categoryId}: ${error.message || 'Unknown error'}`,
        )
      }
    }

    return NextResponse.json({
      message: `Updated ${results.success} categories successfully${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
      results,
    })
  } catch (error) {
    console.error('Error updating categories:', error)
    return NextResponse.json(
      { error: 'Failed to process category updates', details: String(error) },
      { status: 500 },
    )
  }
}
