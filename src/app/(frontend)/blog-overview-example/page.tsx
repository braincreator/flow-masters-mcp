import React from 'react'
import { BlogBlock } from '@/types/blocks'
import BlogComponent from '@/blocks/Blog/Component'

// Sample blog post data
const samplePosts: BlogBlock['posts'] = [
  {
    id: 'post-1',
    title: 'Getting Started with the Page Builder System',
    slug: 'getting-started-with-page-builder',
    publishedAt: '2023-09-15T12:00:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1603969072881-b0fc7f3d77d7?q=80&w=2940&auto=format&fit=crop',
    excerpt:
      'Learn how to use our page builder system to create dynamic and engaging pages without writing code.',
    author: {
      id: 'author-1',
      name: 'Jane Smith',
      slug: 'jane-smith',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    },
  },
  {
    id: 'post-2',
    title: 'Advanced Page Builder Techniques',
    slug: 'advanced-page-builder-techniques',
    publishedAt: '2023-10-05T14:30:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=2936&auto=format&fit=crop',
    excerpt:
      'Take your page building skills to the next level with these advanced techniques and tips.',
    author: {
      id: 'author-2',
      name: 'Michael Brown',
      slug: 'michael-brown',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop',
    },
  },
  {
    id: 'post-3',
    title: 'Optimizing Your Pages for SEO',
    slug: 'optimizing-pages-for-seo',
    publishedAt: '2023-09-28T09:15:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2874&auto=format&fit=crop',
    excerpt:
      'Learn how to optimize your page builder pages for better search engine visibility and rankings.',
    author: {
      id: 'author-3',
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2940&auto=format&fit=crop',
    },
  },
  {
    id: 'post-4',
    title: 'Creating Responsive Layouts',
    slug: 'creating-responsive-layouts',
    publishedAt: '2023-09-20T11:45:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=2830&auto=format&fit=crop',
    excerpt:
      'Tips and tricks for creating layouts that look great on all devices, from desktop to mobile.',
    author: {
      id: 'author-1',
      name: 'Jane Smith',
      slug: 'jane-smith',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    },
  },
  {
    id: 'post-5',
    title: 'Customizing Block Styles',
    slug: 'customizing-block-styles',
    publishedAt: '2023-09-10T10:20:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2940&auto=format&fit=crop',
    excerpt:
      'Learn how to customize the appearance of your blocks to match your brand and design requirements.',
    author: {
      id: 'author-2',
      name: 'Michael Brown',
      slug: 'michael-brown',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop',
    },
  },
  {
    id: 'post-6',
    title: 'Working with Media in the Page Builder',
    slug: 'working-with-media-page-builder',
    publishedAt: '2023-09-05T16:15:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop',
    excerpt:
      'Tips for effectively incorporating images, videos, and other media into your page builder blocks.',
    author: {
      id: 'author-3',
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2940&auto=format&fit=crop',
    },
  },
  {
    id: 'post-7',
    title: 'Using Dynamic Content in Your Pages',
    slug: 'using-dynamic-content',
    publishedAt: '2023-08-28T09:30:00Z',
    featuredImage:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop',
    excerpt:
      'How to incorporate dynamic content and personalization to create more engaging user experiences.',
    author: {
      id: 'author-1',
      name: 'Jane Smith',
      slug: 'jane-smith',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    },
  },
]

// Sample categories
const sampleCategories: BlogBlock['categories'] = [
  { id: 'cat-1', name: 'Tutorials', slug: 'tutorials', count: 12 },
  { id: 'cat-2', name: 'Page Builder', slug: 'page-builder', count: 8 },
  { id: 'cat-3', name: 'SEO', slug: 'seo', count: 5 },
  { id: 'cat-4', name: 'Responsive Design', slug: 'responsive-design', count: 7 },
  { id: 'cat-5', name: 'Performance', slug: 'performance', count: 4 },
]

// Sample tags
const sampleTags: BlogBlock['tags'] = [
  { id: 'tag-1', name: 'Getting Started', slug: 'getting-started', count: 5 },
  { id: 'tag-2', name: 'UI/UX', slug: 'ui-ux', count: 10 },
  { id: 'tag-3', name: 'Content Management', slug: 'content-management', count: 7 },
  { id: 'tag-4', name: 'Optimization', slug: 'optimization', count: 6 },
  { id: 'tag-5', name: 'Best Practices', slug: 'best-practices', count: 9 },
  { id: 'tag-6', name: 'Mobile', slug: 'mobile', count: 8 },
  { id: 'tag-7', name: 'Customization', slug: 'customization', count: 11 },
  { id: 'tag-8', name: 'Media', slug: 'media', count: 5 },
  { id: 'tag-9', name: 'Analytics', slug: 'analytics', count: 3 },
  { id: 'tag-10', name: 'Accessibility', slug: 'accessibility', count: 4 },
]

export default function BlogOverviewExamplePage() {
  return (
    <div className="min-h-screen py-10">
      <BlogComponent
        blockType="blog"
        heading="Our Blog"
        subheading="Latest Articles"
        description="Explore our latest articles, tutorials, and resources about the page builder system and web development."
        posts={samplePosts}
        categories={sampleCategories}
        tags={sampleTags}
        layout="grid"
        postsPerPage={6}
        showFeaturedPost={true}
        showSearch={true}
        showCategories={true}
        showTags={true}
        settings={{
          padding: {
            top: 'medium',
            bottom: 'large',
          },
        }}
      />
    </div>
  )
}
