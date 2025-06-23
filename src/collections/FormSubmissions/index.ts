import { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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

            // Legacy integration event
            await integrationService.processEvent('form.submitted', {
              formId: doc.form,
              submissionId: doc.id,
              submission: doc.submissionData,
              submittedAt: doc.createdAt,
            })

            // Новая система событий
            const eventService = serviceRegistry.getEventService()
            if (eventService) {
              // Получаем название формы безопасно
              let formTitle = 'Unknown Form'
              if (typeof doc.form === 'object' && doc.form?.title) {
                formTitle = doc.form.title
              } else if (typeof doc.form === 'string') {
                // Если form - это ID, попробуем получить форму
                try {
                  const formDoc = await req.payload.findByID({
                    collection: 'forms',
                    id: doc.form,
                  })
                  formTitle = formDoc?.title || 'Unknown Form'
                } catch (error) {
                  logWarn('Could not fetch form title:', error)
                }
              }

              await eventService.publishEvent('form.submitted', {
                id: doc.id,
                formId: typeof doc.form === 'object' ? doc.form.id : doc.form,
                formTitle,
                submissionData: doc.submissionData,
                metadata: doc.metadata,
                submittedAt: doc.createdAt,
                ipAddress: doc.ipAddress,
                status: doc.submissionStatus,
              }, {
                source: 'form_submission',
                collection: 'form-submissions',
                operation,
                userId: req.user?.id,
                userEmail: req.user?.email,
              })
            }

            // Legacy Telegram notification (будет заменено на систему событий)
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
            logError('Error processing form submission:', error)
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
      required: false, // Делаем необязательным для совместимости с legacy API
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
        {
          name: 'type',
          type: 'text',
          label: 'Field Type',
          admin: {
            description: 'Type of the field value (string, number, boolean, etc.)',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Field Label',
          admin: {
            description: 'Human-readable label for the field',
          },
        },
        {
          name: 'required',
          type: 'checkbox',
          label: 'Required Field',
          defaultValue: false,
        },
        {
          name: 'validationPassed',
          type: 'checkbox',
          label: 'Validation Passed',
          defaultValue: true,
        },
      ],
    },
    // Метаданные формы
    {
      name: 'metadata',
      type: 'group',
      label: 'Form Metadata',
      admin: {
        description: 'Comprehensive metadata collected during form submission',
        condition: (data) => !!data.metadata,
      },
      fields: [
        // UTM и источники трафика
        {
          name: 'utmData',
          type: 'group',
          label: 'UTM Data',
          fields: [
            { name: 'utm_source', type: 'text', label: 'UTM Source' },
            { name: 'utm_medium', type: 'text', label: 'UTM Medium' },
            { name: 'utm_campaign', type: 'text', label: 'UTM Campaign' },
            { name: 'utm_term', type: 'text', label: 'UTM Term' },
            { name: 'utm_content', type: 'text', label: 'UTM Content' },
            { name: 'gclid', type: 'text', label: 'Google Click ID' },
            { name: 'fbclid', type: 'text', label: 'Facebook Click ID' },
            { name: 'yclid', type: 'text', label: 'Yandex Click ID' },
          ],
        },
        // Источник трафика
        {
          name: 'trafficSource',
          type: 'group',
          label: 'Traffic Source',
          fields: [
            { name: 'referrer', type: 'text', label: 'Referrer' },
            { name: 'landing_page', type: 'text', label: 'Landing Page' },
            { name: 'current_page', type: 'text', label: 'Current Page' },
            { name: 'previous_page', type: 'text', label: 'Previous Page' },
            { name: 'search_engine', type: 'text', label: 'Search Engine' },
            { name: 'organic_keyword', type: 'text', label: 'Organic Keyword' },
          ],
        },
        // Информация об устройстве
        {
          name: 'deviceInfo',
          type: 'group',
          label: 'Device Information',
          fields: [
            { name: 'user_agent', type: 'textarea', label: 'User Agent' },
            { name: 'browser_name', type: 'text', label: 'Browser Name' },
            { name: 'browser_version', type: 'text', label: 'Browser Version' },
            { name: 'os_name', type: 'text', label: 'OS Name' },
            { name: 'os_version', type: 'text', label: 'OS Version' },
            {
              name: 'device_type',
              type: 'select',
              label: 'Device Type',
              options: [
                { label: 'Desktop', value: 'desktop' },
                { label: 'Mobile', value: 'mobile' },
                { label: 'Tablet', value: 'tablet' },
              ],
            },
            { name: 'screen_resolution', type: 'text', label: 'Screen Resolution' },
            { name: 'viewport_size', type: 'text', label: 'Viewport Size' },
            { name: 'language', type: 'text', label: 'Language' },
            { name: 'timezone', type: 'text', label: 'Timezone' },
            { name: 'touch_support', type: 'checkbox', label: 'Touch Support' },
          ],
        },
        // Поведенческие данные
        {
          name: 'userBehavior',
          type: 'group',
          label: 'User Behavior',
          fields: [
            { name: 'session_id', type: 'text', label: 'Session ID' },
            { name: 'time_on_page', type: 'number', label: 'Time on Page (seconds)' },
            { name: 'time_on_site', type: 'number', label: 'Time on Site (seconds)' },
            { name: 'scroll_depth', type: 'number', label: 'Scroll Depth (%)' },
            { name: 'max_scroll_depth', type: 'number', label: 'Max Scroll Depth (%)' },
            { name: 'page_views_count', type: 'number', label: 'Page Views Count' },
            { name: 'is_returning_visitor', type: 'checkbox', label: 'Returning Visitor' },
            { name: 'visit_count', type: 'number', label: 'Visit Count' },
            { name: 'mouse_movements', type: 'number', label: 'Mouse Movements' },
            { name: 'clicks_count', type: 'number', label: 'Clicks Count' },
            {
              name: 'pages_visited',
              type: 'array',
              label: 'Pages Visited',
              fields: [
                { name: 'page', type: 'text', required: true },
              ],
            },
          ],
        },
        // Информация о сессии
        {
          name: 'sessionInfo',
          type: 'group',
          label: 'Session Information',
          fields: [
            { name: 'is_authenticated', type: 'checkbox', label: 'Authenticated' },
            { name: 'user_id', type: 'text', label: 'User ID' },
            { name: 'user_email', type: 'email', label: 'User Email' },
            { name: 'user_role', type: 'text', label: 'User Role' },
            { name: 'registration_date', type: 'date', label: 'Registration Date' },
            { name: 'last_login', type: 'date', label: 'Last Login' },
          ],
        },
        // Контекст формы
        {
          name: 'formContext',
          type: 'group',
          label: 'Form Context',
          fields: [
            { name: 'form_type', type: 'text', label: 'Form Type', required: true },
            { name: 'form_name', type: 'text', label: 'Form Name' },
            { name: 'form_location', type: 'text', label: 'Form Location' },
            { name: 'form_trigger', type: 'text', label: 'Form Trigger' },
            { name: 'modal_context', type: 'checkbox', label: 'Modal Context' },
            { name: 'submission_attempt', type: 'number', label: 'Submission Attempt' },
            { name: 'ab_test_variant', type: 'text', label: 'A/B Test Variant' },
          ],
        },
      ],
    },
    // Статус обработки
    {
      name: 'submissionStatus',
      type: 'select',
      label: 'Submission Status',
      defaultValue: 'success',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Pending', value: 'pending' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Error Message',
      admin: {
        condition: (data) => data.submissionStatus === 'error',
        position: 'sidebar',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      label: 'Processed At',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    // IP адрес для логирования
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP Address',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'IP address of the submitter',
      },
    },
  ],
  timestamps: true,
}
