import React from 'react'
import { BlogPostBlock } from '@/types/blocks'
import BlogPostComponent from '@/blocks/BlogPost/Component'

// Sample blog post data
const samplePost: BlogPostBlock['post'] = {
  id: 'sample-post-1',
  title: 'Getting Started with the Page Builder System',
  slug: 'getting-started-with-page-builder',
  publishedAt: '2023-09-15T12:00:00Z',
  featuredImage:
    'https://images.unsplash.com/photo-1603969072881-b0fc7f3d77d7?q=80&w=2940&auto=format&fit=crop',
  excerpt:
    'Learn how to use our page builder system to create dynamic and engaging pages without writing code.',
  content: (
    <div>
      <h2 id="introduction">Introduction</h2>
      <p>
        Welcome to our page builder system! This guide will walk you through the basics of creating
        and managing pages using our drag-and-drop interface. Whether you're a content manager,
        marketer, or developer, this system is designed to make page creation simple and flexible.
      </p>

      <h2 id="block-types">Block Types</h2>
      <p>
        Our page builder comes with a variety of block types that you can use to build your pages.
        Each block serves a specific purpose and can be customized to fit your needs.
      </p>

      <h3 id="hero-blocks">Hero Blocks</h3>
      <p>
        Hero blocks are typically used at the top of a page to grab attention and communicate the
        main message. They can include background images, headings, subheadings, and call-to-action
        buttons.
      </p>

      <h3 id="content-blocks">Content Blocks</h3>
      <p>
        Content blocks allow you to add rich text, images, and other media to your page. They're
        versatile and can be used for various purposes, from blog posts to product descriptions.
      </p>

      <h3 id="gallery-blocks">Gallery Blocks</h3>
      <p>
        Gallery blocks let you display a collection of images in a grid or carousel format. They're
        perfect for showcasing products, portfolio work, or event photos.
      </p>

      <h2 id="customization">Customization</h2>
      <p>
        Each block can be customized to match your brand's look and feel. You can adjust colors,
        fonts, spacing, and other design elements to create a cohesive experience.
      </p>

      <h2 id="publishing">Publishing Your Page</h2>
      <p>
        Once you're satisfied with your page, you can preview it to see how it will look to
        visitors. When you're ready, simply hit the "Publish" button to make it live on your site.
      </p>

      <h2 id="conclusion">Conclusion</h2>
      <p>
        With our page builder system, creating beautiful, functional pages is easier than ever. We
        hope this guide has given you a good starting point. Happy building!
      </p>
    </div>
  ),
  author: {
    id: 'author-1',
    name: 'Jane Smith',
    slug: 'jane-smith',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    role: 'Content Strategist',
    bio: 'Jane is a content strategist with over 10 years of experience in digital marketing and content creation. She specializes in helping businesses create engaging and effective online content.',
    social: {
      twitter: 'https://twitter.com/janesmith',
      linkedin: 'https://linkedin.com/in/janesmith',
      github: 'https://github.com/janesmith',
      website: 'https://janesmith.com',
    },
  },
  categories: [
    { id: 'cat-1', name: 'Tutorials', slug: 'tutorials', count: 12 },
    { id: 'cat-2', name: 'Page Builder', slug: 'page-builder', count: 8 },
  ],
  tags: [
    { id: 'tag-1', name: 'Getting Started', slug: 'getting-started', count: 5 },
    { id: 'tag-2', name: 'UI/UX', slug: 'ui-ux', count: 10 },
    { id: 'tag-3', name: 'Content Management', slug: 'content-management', count: 7 },
  ],
}

// Sample related posts
const relatedPosts: BlogPostBlock['relatedPosts'] = [
  {
    id: 'related-1',
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
    categories: [{ id: 'cat-1', name: 'Tutorials', slug: 'tutorials' }],
  },
  {
    id: 'related-2',
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
    categories: [{ id: 'cat-3', name: 'SEO', slug: 'seo' }],
  },
  {
    id: 'related-3',
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
    categories: [{ id: 'cat-4', name: 'Responsive Design', slug: 'responsive-design' }],
  },
]

export default function BlogPostExamplePage() {
  return (
    <div className="min-h-screen">
      <BlogPostComponent
        blockType="blogPost"
        post={samplePost}
        relatedPosts={relatedPosts}
        showTableOfContents={true}
        showAuthor={true}
        showDate={true}
        showReadingTime={true}
        showComments={true}
        showShareButtons={true}
        showRelatedPosts={true}
        showTags={true}
        showReadingProgress={true}
        settings={{
          padding: {
            top: 'none',
            bottom: 'none',
          },
        }}
      />
    </div>
  )
}
