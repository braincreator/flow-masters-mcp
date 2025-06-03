import React from 'react'
import { Block } from '@/types/blocks'
import { RenderBlocks } from '@/blocks/RenderBlocks'

// Example blog post blocks
const blogBlocks: Block[] = [
  // Article Header Block
  {
    blockType: 'articleHeader',
    title: 'The Future of Web Development: Trends to Watch in 2023',
    subtitle: 'Exploring the latest technologies and approaches shaping modern web development',
    authorInfo: {
      name: 'Alex Johnson',
      role: 'Senior Developer',
      avatar: {
        url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
        alt: 'Alex Johnson',
      },
    },
    publishDate: '2023-05-15T08:00:00Z',
    readTime: '8',
    categories: ['Web Development', 'Technology', 'Frontend'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1627399270231-7d36245355a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
      alt: 'Web Development Trends',
    },
    settings: {
      padding: {
        top: 'large',
        bottom: 'medium',
      },
    },
  },

  // Table of Contents Block
  {
    blockType: 'tableOfContents',
    title: 'In this article',
    autoGenerate: false,
    items: [
      { title: 'Introduction', anchor: 'introduction', level: 1 },
      { title: 'AI-Driven Development', anchor: 'ai-driven-development', level: 2 },
      { title: 'WebAssembly', anchor: 'webassembly', level: 2 },
      { title: 'Jamstack Architecture', anchor: 'jamstack', level: 2 },
      { title: 'Progressive Web Apps', anchor: 'pwas', level: 2 },
      { title: 'Conclusion', anchor: 'conclusion', level: 1 },
    ],
    sticky: true,
    settings: {
      padding: {
        top: 'small',
        bottom: 'medium',
      },
    },
  },

  // Content block for introduction
  {
    blockType: 'content',
    columns: [
      {
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'h2',
                children: [{ text: 'Introduction', type: 'text' }],
                id: 'introduction',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: "The web development landscape continues to evolve at a rapid pace. Each year brings new frameworks, tools, and methodologies that reshape how we approach building digital experiences. In this article, we'll explore the key trends that are defining the future of web development and how they might impact your projects in the coming years.",
                    type: 'text',
                  },
                ],
              },
            ],
          },
        },
      },
    ],
    settings: {
      padding: {
        top: 'medium',
        bottom: 'medium',
      },
    },
  },

  // Blockquote Block
  {
    blockType: 'blockquote',
    quote:
      'The most important skill for a programmer is the ability to learn, unlearn, and relearn as technologies evolve.',
    author: 'John Doe',
    source: 'Web Development Summit 2023',
    alignment: 'center',
    settings: {
      padding: {
        top: 'medium',
        bottom: 'medium',
      },
    },
  },

  // Content block for AI-Driven Development
  {
    blockType: 'content',
    columns: [
      {
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'h2',
                children: [{ text: 'AI-Driven Development', type: 'text' }],
                id: 'ai-driven-development',
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Artificial Intelligence is revolutionizing how developers work. From code completion and bug detection to automated testing and optimization, AI tools are becoming an integral part of the development workflow. GitHub Copilot and similar AI pair programmers can suggest entire functions based on comments or previous code, significantly accelerating development speed.',
                    type: 'text',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Beyond coding assistance, AI is being used to generate UI components, optimize performance, and even predict user behavior to create more personalized web experiences.',
                    type: 'text',
                  },
                ],
              },
            ],
          },
        },
      },
    ],
    settings: {
      padding: {
        top: 'medium',
        bottom: 'medium',
      },
    },
  },

  // Audio Block (Podcast snippet)
  {
    blockType: 'audio',
    title: 'Listen to our podcast on AI in web development',
    audioUrl: 'https://example.com/podcast.mp3',
    artwork: {
      url: 'https://images.unsplash.com/photo-1705354766908-9f235ff9b0b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2864&q=80',
      alt: 'Podcast artwork',
    },
    showControls: true,
    settings: {
      padding: {
        top: 'medium',
        bottom: 'large',
      },
    },
  },

  // More content blocks omitted for brevity

  // Author Bio Block
  {
    blockType: 'authorBio',
    author: {
      name: 'Alex Johnson',
      avatar: {
        url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
        alt: 'Alex Johnson',
      },
      bio: 'Alex Johnson is a senior web developer with over 10 years of experience in building modern web applications. He specializes in React, TypeScript, and serverless architectures.',
      role: 'Senior Developer',
      company: 'TechInnovate',
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/alexjohnson' },
        { platform: 'github', url: 'https://github.com/alexjohnson' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/alexjohnson' },
      ],
    },
    layout: 'card',
    settings: {
      padding: {
        top: 'large',
        bottom: 'medium',
      },
    },
  },

  // Social Share Block
  {
    blockType: 'socialShare',
    title: 'Share this article',
    platforms: ['twitter', 'facebook', 'linkedin', 'email', 'copy'],
    layout: 'horizontal',
    showShareCount: true,
    settings: {
      padding: {
        top: 'medium',
        bottom: 'medium',
      },
    },
  },

  // Related Posts Block
  {
    blockType: 'relatedPosts',
    title: 'You might also like',
    posts: [
      {
        title: 'Getting Started with WebAssembly',
        excerpt:
          'Learn the basics of WebAssembly and how to integrate it into your web applications.',
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
          alt: 'WebAssembly code',
        },
        url: '/blog/getting-started-with-webassembly',
        date: '2023-04-22',
      },
      {
        title: 'The Rise of Jamstack Architecture',
        excerpt: 'Explore how Jamstack is changing the way we build and deploy web applications.',
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
          alt: 'Jamstack architecture',
        },
        url: '/blog/rise-of-jamstack',
        date: '2023-03-15',
      },
      {
        title: 'Progressive Web Apps in 2023',
        excerpt:
          "Learn about the latest advancements in PWAs and how they're improving user experiences.",
        featuredImage: {
          url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
          alt: 'Progressive Web App',
        },
        url: '/blog/progressive-web-apps-2023',
        date: '2023-02-28',
      },
    ],
    layout: 'grid',
    columns: 3,
    settings: {
      padding: {
        top: 'large',
        bottom: 'large',
      },
    },
  },

  // Comments Block
  {
    blockType: 'comments',
    title: 'Discussion',
    provider: 'disqus',
    showCount: true,
    settings: {
      padding: {
        top: 'medium',
        bottom: 'large',
      },
    },
  },
]

export default function BlogPostExample() {
  return (
    <article className="blog-post">
      <RenderBlocks blocks={blogBlocks} />
    </article>
  )
}
