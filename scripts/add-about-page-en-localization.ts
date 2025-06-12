import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function addAboutPageEnLocalization() {
  try {
    console.log('Connecting to Payload...')
    const payload = await getPayload({ config: configPromise })
    
    console.log('Adding English localization for About Page global...')
    
    const aboutPageDataEn = {
      hero: {
        title: 'Making AI Accessible for Every Business',
        subtitle: 'A new agency with an experienced founder that transforms complex AI technologies into simple and effective solutions for your business.',
      },
      mission: {
        title: 'Our Mission',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'We created Flow Masters because we believe: artificial intelligence technologies should not be a complex privilege of corporations, but an accessible tool for the growth of any business.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Our goal is to make automation simple, understandable, and effective. We help companies implement AI solutions that actually work and bring measurable benefits.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      stats: {
        title: 'Our Achievements',
        subtitle: 'Numbers that speak for themselves',
        items: [
          {
            value: '2+',
            label: 'years of experience',
            description: 'in business process automation',
            icon: 'trending-up',
          },
          {
            value: '15+',
            label: 'projects',
            description: 'successfully completed',
            icon: 'award',
          },
          {
            value: '40%',
            label: 'cost savings',
            description: 'average client cost reduction',
            icon: 'users',
          },
          {
            value: '3',
            label: 'months',
            description: 'average time to results',
            icon: 'clock',
          },
        ],
      },
      founder: {
        title: 'Founder',
        name: 'Alexander Yudin',
        role: 'Founder and Lead Expert',
        bio: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Over the past 2 years, Alexander has successfully implemented automation projects for companies in various industries, allowing them to reduce costs and increase process efficiency.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'This experience and passion for optimization form the foundation of Flow Masters\' approach to working with clients.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        socialLinks: {
          linkedin: 'https://linkedin.com/in/alexander-yudin',
          telegram: 'https://t.me/flow_masters_bot',
          email: 'admin@flow-masters.ru',
        },
      },
      values: {
        title: 'Our Principles',
        subtitle: 'Values that guide us in our work',
        items: [
          {
            title: 'Honesty',
            description: 'We honestly discuss the capabilities and limitations of AI solutions',
            icon: 'shield-check',
          },
          {
            title: 'Results',
            description: 'We focus on measurable business results, not beautiful presentations',
            icon: 'target',
          },
          {
            title: 'Simplicity',
            description: 'We make complex technologies simple and understandable for business',
            icon: 'lightbulb',
          },
          {
            title: 'Growth',
            description: 'We constantly study new technologies and improve our approaches',
            icon: 'trending-up',
          },
        ],
      },
      approach: {
        title: 'Our Approach',
        subtitle: 'Clear methodology for achieving results',
        steps: [
          {
            title: 'Deep Dive',
            description: 'We conduct a thorough analysis of your business processes and identify growth points',
            icon: 'search',
          },
          {
            title: 'Strategy',
            description: 'We develop an automation strategy with clear ROI forecasts',
            icon: 'strategy',
          },
          {
            title: 'Implementation',
            description: 'We implement AI solutions using proven technologies and best practices',
            icon: 'implementation',
          },
          {
            title: 'Optimization',
            description: 'We analyze results and refine the system for maximum efficiency',
            icon: 'optimization',
          },
        ],
      },
      cta: {
        title: 'Ready to Discuss Your Project?',
        subtitle: 'Tell us about your challenges, and we\'ll propose the optimal solution',
        primaryButton: {
          text: 'Discuss Project',
          url: '/contact',
        },
        secondaryButton: {
          text: 'View Services',
          url: '/services',
        },
      },
      seo: {
        title: 'About Us - Flow Masters | AI Business Automation Agency',
        description: 'Learn about Flow Masters - a new AI agency with an experienced founder. Making artificial intelligence accessible for every business.',
        keywords: 'Flow Masters, AI agency, business automation, artificial intelligence, Alexander Yudin',
      },
    }

    const result = await payload.updateGlobal({
      slug: 'about-page',
      data: aboutPageDataEn,
      locale: 'en',
    })

    console.log('English localization for About Page global added successfully!')
    console.log('English page will be available at: /en/about')
    
    process.exit(0)
  } catch (error) {
    console.error('Error adding English localization:', error)
    process.exit(1)
  }
}

addAboutPageEnLocalization()
