import { NextResponse } from 'next/server'

// List of all category types used in the system
const CATEGORY_TYPES = [
  {
    id: 'product',
    label: 'Product Category',
    description: 'Categories for products in the store',
  },
  {
    id: 'blog',
    label: 'Blog Category',
    description: 'Categories for blog posts and articles',
  },
  {
    id: 'general',
    label: 'General Category',
    description: 'General purpose categories used across the site',
  },
]

export async function GET() {
  return NextResponse.json(CATEGORY_TYPES)
}
