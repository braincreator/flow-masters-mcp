'use client'

import React from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Block } from '@/types/blocks'

// Example of a page with multiple block types
export const BlocksExample: React.FC = () => {
  // This would typically come from an API or CMS
  const pageBlocks: Block[] = [
    // Hero Block
    {
      blockType: 'hero',
      id: 'hero-1',
      heading: 'Welcome to Our Page Builder',
      subheading: 'Create beautiful pages with our easy-to-use block system',
      content: {
        root: {
          children: [
            {
              children: [
                { text: 'This flexible page builder allows you to create any layout you need.' }
              ]
            }
          ]
        }
      },
      layout: 'center',
      actions: [
        {
          label: 'Get Started',
          type: 'button',
          variant: 'primary',
        },
        {
          label: 'Learn More',
          type: 'link',
          variant: 'outline',
          url: '#',
        }
      ],
      settings: {
        fullWidth: true,
        background: {
          color: '#f9fafb',
        },
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Features Block
    {
      blockType: 'featureGrid',
      id: 'features-1',
      heading: 'Key Features',
      subheading: 'Everything you need to build beautiful pages',
      columns: 3,
      features: [
        {
          title: 'Flexible Layouts',
          description: 'Create any layout with our flexible grid system and block components.',
          icon: '📐',
        },
        {
          title: 'Beautiful Components',
          description: 'Pre-designed components that look great out of the box.',
          icon: '🎨',
        },
        {
          title: 'Easy to Use',
          description: 'Simple drag-and-drop interface makes page building a breeze.',
          icon: '🚀',
        }
      ],
      settings: {
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Carousel Block
    {
      blockType: 'carousel',
      id: 'carousel-1',
      items: [
        {
          heading: 'Build Beautiful Websites',
          caption: 'Slide 1',
          content: 'Create stunning layouts and user experiences with our flexible building blocks.',
          media: {
            url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
            alt: 'Workspace with computer and notebook',
          },
          actions: [
            {
              label: 'Learn More',
              type: 'link',
              url: '#',
              variant: 'outline',
            }
          ]
        },
        {
          heading: 'Grow Your Business',
          caption: 'Slide 2',
          content: 'Our page builder helps you create high-converting landing pages quickly.',
          media: {
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
            alt: 'Business growth chart',
          },
          actions: [
            {
              label: 'Get Started',
              type: 'button',
              url: '#',
              variant: 'primary',
            }
          ]
        },
      ],
      autoplay: true,
      interval: 5000,
      showControls: true,
      showIndicators: true,
      settings: {
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Stats Block
    {
      blockType: 'stats',
      id: 'stats-1',
      heading: 'Our Impact',
      stats: [
        {
          value: '10k+',
          label: 'Users',
          description: 'Active users building with our system',
        },
        {
          value: '25+',
          label: 'Block Types',
          description: 'Components to build any layout',
        },
        {
          value: '99%',
          label: 'Satisfaction',
          description: 'Customer satisfaction rating',
        },
        {
          value: '24/7',
          label: 'Support',
          description: 'We\'re here to help',
        }
      ],
      settings: {
        background: {
          color: '#f3f4f6',
        },
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Video Block
    {
      blockType: 'video',
      id: 'video-1',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
      caption: 'Watch our tutorial to learn more about our page builder',
      settings: {
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Gallery Block
    {
      blockType: 'gallery',
      id: 'gallery-1',
      heading: 'Project Showcase',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d',
          alt: 'Website design project 1',
        },
        {
          url: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f',
          alt: 'Website design project 2',
        },
        {
          url: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f',
          alt: 'Website design project 3',
        },
        {
          url: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd',
          alt: 'Website design project 4',
        },
        {
          url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb',
          alt: 'Website design project 5',
        },
        {
          url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974',
          alt: 'Website design project 6',
        },
      ],
      layout: 'grid',
      columns: 3,
      lightbox: true,
      settings: {
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Countdown Block
    {
      blockType: 'countdown',
      id: 'countdown-1',
      title: 'New Version Launching Soon',
      targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      format: 'full',
      actions: [
        {
          label: 'Join Waitlist',
          type: 'button',
          variant: 'primary',
        }
      ],
      settings: {
        background: {
          color: '#e0f2fe',
        },
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // Testimonial Block
    {
      blockType: 'testimonial',
      id: 'testimonial-1',
      testimonials: [
        {
          quote: 'This page builder has transformed how we create landing pages. It's so intuitive and the results are beautiful.',
          author: 'Jane Cooper',
          role: 'CEO',
          company: 'Acme Inc',
        }
      ],
      layout: 'single',
      settings: {
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // FAQ Block
    {
      blockType: 'faq',
      id: 'faq-1',
      heading: 'Frequently Asked Questions',
      subheading: 'Find answers to common questions about our page builder',
      items: [
        {
          question: 'How does the page builder work?',
          answer: 'Our page builder uses a block-based system where you can add, remove, and rearrange different content blocks to create your perfect page layout.'
        },
        {
          question: 'Can I customize the styles?',
          answer: 'Yes, each block comes with numerous customization options, and you can also add custom CSS.'
        },
        {
          question: 'Is it responsive?',
          answer: 'Absolutely! All blocks are designed to look great on any device, from mobile to desktop.'
        }
      ],
      settings: {
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    },
    
    // CTA Block
    {
      blockType: 'cta',
      id: 'cta-1',
      heading: 'Ready to Get Started?',
      content: {
        root: {
          children: [
            {
              children: [
                { text: 'Join thousands of satisfied customers building beautiful web pages with our system.' }
              ]
            }
          ]
        }
      },
      actions: [
        {
          label: 'Sign Up Now',
          type: 'button',
          variant: 'primary',
          size: 'large',
        }
      ],
      layout: 'center',
      settings: {
        background: {
          color: '#1e40af',
          overlay: true,
          overlayOpacity: 0.9,
        },
        padding: {
          top: 'large',
          bottom: 'large',
        }
      }
    }
  ]

  return (
    <div className="page-container">
      <RenderBlocks blocks={pageBlocks} />
    </div>
  )
} 