'use client'

import React from 'react'
import { useConfig } from '@payloadcms/ui'
import { useTranslations } from 'next-intl'

export const WebhookInstructions: React.FC = () => {
  const t = useTranslations('CalendlyWebhookInstructions')
  const { serverURL } = useConfig()
  const webhookUrl = `${serverURL}/api/calendly-webhooks`

  return (
    <div
      style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f7f7f7', borderRadius: '4px' }}
    >
      <h2>{t('title')}</h2>
      <p>
        Для отслеживания статусов бронирований из Calendly, необходимо настроить вебхуки в панели
        администратора Calendly.
      </p>

      <h3>{t('stepsTitle')}</h3>
      <ol style={{ lineHeight: '1.6' }}>
        <li>{t('step1')}</li>
        <li>{t('step2', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>{t('step3', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>{t('step4', { strong: (chunks) => <strong>{chunks}</strong> })}</li>
        <li>
          {t('step5.part1')}
          <div
            style={{
              padding: '10px',
              backgroundColor: '#e9e9e9',
              borderRadius: '4px',
              marginTop: '10px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {webhookUrl}
          </div>
        </li>
        <li>
          {t('step6.title')}
          <ul style={{ marginTop: '10px' }}>
            <li>
              <strong>invitee.created</strong> - {t('step6.eventCreated')}
            </li>
            <li>
              <strong>invitee.canceled</strong> - {t('step6.eventCanceled')}
            </li>
            <li>
              <strong>invitee.rescheduled</strong> - {t('step6.eventRescheduled')}
            </li>
            <li>
              <strong>invitee_no_show.created</strong> - {t('step6.eventNoShow')}
            </li>
          </ul>
        </li>
        <li>{t('step7')}</li>
      </ol>

      <h3>{t('envSetupTitle')}</h3>
      <p>
        Для безопасной работы вебхуков необходимо добавить секретный ключ в переменные окружения
        вашего проекта:
      </p>
      <div
        style={{
          padding: '10px',
          backgroundColor: '#e9e9e9',
          borderRadius: '4px',
          marginTop: '10px',
          fontFamily: 'monospace',
        }}
      >
        CALENDLY_WEBHOOK_SECRET=your_webhook_signing_secret
      </div>
      <p style={{ marginTop: '10px' }}>
        Секретный ключ можно получить при создании вебхука в Calendly.
      </p>

      <h3>{t('checkWebhooksTitle')}</h3>
      <p>
        После настройки вебхуков, создайте тестовое бронирование в Calendly и проверьте, что оно
        появилось в коллекции Bookings.
      </p>
    </div>
  )
}

export default WebhookInstructions
