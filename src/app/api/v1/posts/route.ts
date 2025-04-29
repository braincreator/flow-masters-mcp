import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';
import { Post } from '@/payload-types';

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config });

  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en'; // Default to 'en' if locale is not provided
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const authors = searchParams.get('authors')?.split(',').filter(Boolean);
    const searchQuery = searchParams.get('search');

    console.log('API received search query:', searchQuery); // Debug log

    const query: any = {
      collection: 'posts',
      locale,
      limit,
      page,
      where: {},
      depth: 1, // Fetch related data like author, categories, tags
    };

    if (categories && categories.length > 0) {
      query.where.categories = {
        in: categories,
      };
    }

    if (tags && tags.length > 0) {
      query.where.tags = {
        in: tags,
      };
    }

    if (authors && authors.length > 0) {
      query.where.author = {
        in: authors,
      };
    }

    if (searchQuery) {
      // Add search condition to the where clause
      // Assuming 'title' and 'content' are fields to search within
      query.where.or = [
        {
          title: {
            like: searchQuery,
          },
        },
        {
          content: { // Assuming 'content' is a text field
            like: searchQuery,
          },
        },
      ];
    }

    const posts = await payload.find(query);

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
  }
}
