export const IntegrationTemplates = [
  {
    slug: 'slack',
    label: 'Slack Notifications',
    description: 'Send notifications to Slack channels',
    defaultConfig: {
      webhook_url: '',
      channel: '#general',
      username: 'Bot',
    },
    actions: [
      {
        type: 'http',
        config: {
          method: 'POST',
          url: '{{webhook_url}}',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            channel: '{{channel}}',
            username: '{{username}}',
            text: '{{message}}',
          },
        },
      },
    ],
  },
  {
    slug: 'zapier',
    label: 'Zapier',
    description: 'Connect with thousands of apps via Zapier',
    defaultConfig: {
      webhook_url: '',
    },
    actions: [
      {
        type: 'http',
        config: {
          method: 'POST',
          url: '{{webhook_url}}',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
    ],
  },
  {
    slug: 'email',
    label: 'Email Notifications',
    description: 'Send customized email notifications',
    defaultConfig: {
      to: '',
      subject: '',
      template: 'default',
    },
    actions: [
      {
        type: 'email',
        config: {
          to: '{{to}}',
          subject: '{{subject}}',
          template: '{{template}}',
        },
      },
    ],
  },
  {
    slug: 'custom',
    label: 'Custom Integration',
    description: 'Build your own custom integration',
    defaultConfig: {},
    actions: [],
  },
]