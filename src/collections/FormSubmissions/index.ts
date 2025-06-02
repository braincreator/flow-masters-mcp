import { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { ServiceRegistry } from '@/services/service.registry'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    group: 'Content',
    defaultColumns: ['form', 'submissionData', 'createdAt'],
    description: 'Submissions from forms on the website.',
  },
  access: {
    read: authenticated,
    create: anyone, // Allow public form submissions
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          try {
            const serviceRegistry = ServiceRegistry.getInstance(req.payload)
            const integrationService = serviceRegistry.getIntegrationService()

            // Trigger integration event for form submission
            await integrationService.processEvent('form.submitted', {
              formId: doc.form,
              submissionId: doc.id,
              submission: doc.submissionData,
              submittedAt: doc.createdAt,
            })

            // Send Telegram notification
            const telegramService = serviceRegistry.getTelegramService()
            if (telegramService) {
              // Format submission data for Telegram
              const submissionText = doc.submissionData
                .map((item: any) => `${item.field}: ${item.value}`)
                .join('\n')

              const message = `🚀 Новая заявка с AI Agency лендинга!\n\n${submissionText}\n\nВремя: ${new Date(doc.createdAt).toLocaleString('ru-RU')}`

              await telegramService.sendMessage(message, {
                parseMode: 'HTML',
                disableWebPagePreview: true,
              })
            }
          } catch (error) {
            console.error('Error processing form submission:', error)
            // Don't throw error to prevent form submission failure
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      label: 'Form',
      admin: {
        description: 'The form this submission belongs to.',
      },
    },
    {
      name: 'submissionData',
      type: 'array',
      label: 'Submission Data',
      fields: [
        {
          name: 'field',
          type: 'text',
          required: true,
          label: 'Field Name',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Field Value',
        },
      ],
    },
  ],
  timestamps: true,
}
