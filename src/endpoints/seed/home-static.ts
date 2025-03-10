import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'highImpact',
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Transform Your Business with AI Automation',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
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
                text: 'Streamline operations, reduce costs, and accelerate growth with enterprise-grade AI solutions.',
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
    links: [
      {
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'Get Started',
          url: '/contact',
        },
      },
      {
        link: {
          type: 'custom',
          appearance: 'outline',
          label: 'View Solutions',
          url: '/solutions',
        },
      },
    ],
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'oneThird',
          richText: {
            root: {
              children: [
                {
                  type: 'heading',
                  tag: 'h3',
                  children: [{ text: 'Process Automation' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Automate repetitive tasks and workflows with AI-powered solutions that learn and adapt to your business processes.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          size: 'oneThird',
          richText: {
            root: {
              children: [
                {
                  type: 'heading',
                  tag: 'h3',
                  children: [{ text: 'Data Intelligence' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Transform raw data into actionable insights with our advanced analytics and machine learning capabilities.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          size: 'oneThird',
          richText: {
            root: {
              children: [
                {
                  type: 'heading',
                  tag: 'h3',
                  children: [{ text: 'Custom Solutions' }],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Get tailored AI solutions designed specifically for your industry and business requirements.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    {
      blockType: 'callToAction',
      richText: {
        root: {
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ text: 'Ready to Automate?' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Join leading companies that have transformed their operations with our AI solutions.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Schedule a Demo',
            url: '/contact',
          },
        },
      ],
    },
  ],
  meta: {
    title: 'AI Automation Agency | Transform Your Business with AI',
    description:
      'Leading AI automation agency helping businesses streamline operations, reduce costs, and accelerate growth with enterprise-grade AI solutions.',
  },
  title: 'Home',
}
