'use client'

import React from 'react'
import { useConfig } from '@payloadcms/ui'

export const WebhookInstructions: React.FC = () => {
  const { serverURL } = useConfig()
  const webhookUrl = `${serverURL}/api/v1/calendly-webhooks`

  return (
    <div
      style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f7f7f7', borderRadius: '4px' }}
    >
      <h2>Настройка вебхуков Calendly</h2>
      <p>
        Для отслеживания статусов бронирований из Calendly, необходимо настроить вебхуки в панели
        администратора Calendly.
      </p>

      <h3>Шаги настройки:</h3>
      <ol style={{ lineHeight: '1.6' }}>
        <li>Войдите в свой аккаунт Calendly</li>
        <li>
          Перейдите в раздел <strong>Integrations</strong>
        </li>
        <li>
          Выберите <strong>Webhooks</strong>
        </li>
        <li>
          Нажмите <strong>Create New Webhook</strong>
        </li>
        <li>
          Введите URL вебхука:
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
          Выберите события для отслеживания:
          <ul style={{ marginTop: '10px' }}>
            <li>
              <strong>invitee.created</strong> - создание нового бронирования
            </li>
            <li>
              <strong>invitee.canceled</strong> - отмена бронирования
            </li>
            <li>
              <strong>invitee.rescheduled</strong> - перенос бронирования
            </li>
            <li>
              <strong>invitee_no_show.created</strong> - клиент не явился
            </li>
          </ul>
        </li>
        <li>Сохраните настройки вебхука</li>
      </ol>

      <h3>Настройка переменных окружения</h3>
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

      <h3>Проверка работы вебхуков</h3>
      <p>
        После настройки вебхуков, создайте тестовое бронирование в Calendly и проверьте, что оно
        появилось в коллекции Bookings.
      </p>
    </div>
  )
}

export default WebhookInstructions
