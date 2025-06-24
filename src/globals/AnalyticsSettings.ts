/**
 * Payload CMS Global для настроек аналитики
 */

import type { GlobalConfig } from 'payload'

export const AnalyticsSettings: GlobalConfig = {
  slug: 'analytics-settings',
  label: 'Настройки аналитики',
  access: {
    read: () => true, // Публичное чтение для фронтенда
    update: ({ req: { user } }) => !!user, // Только авторизованные пользователи могут изменять
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Общие настройки',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Включить аналитику',
              defaultValue: true,
              admin: {
                description: 'Глобальное включение/выключение всей аналитики'
              }
            },
            {
              name: 'debug',
              type: 'checkbox',
              label: 'Режим отладки',
              defaultValue: false,
              admin: {
                description: 'Показывать отладочную панель и логи в консоли'
              }
            },
            {
              name: 'trackingDomains',
              type: 'array',
              label: 'Домены для отслеживания',
              admin: {
                description: 'Оставьте пустым для отслеживания на всех доменах'
              },
              fields: [
                {
                  name: 'domain',
                  type: 'text',
                  label: 'Домен',
                  required: true
                }
              ]
            },
            {
              name: 'excludePaths',
              type: 'array',
              label: 'Исключенные пути',
              admin: {
                description: 'Пути, на которых не нужно отслеживать события'
              },
              fields: [
                {
                  name: 'path',
                  type: 'text',
                  label: 'Путь',
                  required: true,
                  admin: {
                    placeholder: '/admin'
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Yandex Metrica',
          fields: [
            {
              name: 'yandexMetricaEnabled',
              type: 'checkbox',
              label: 'Включить Yandex Metrica',
              defaultValue: true
            },
            {
              name: 'yandexMetricaId',
              type: 'text',
              label: 'ID счетчика Yandex Metrica',
              admin: {
                condition: (data) => data.yandexMetricaEnabled,
                placeholder: '98849829',
                description: 'Найдите в настройках счетчика на metrica.yandex.ru'
              },
              validate: (value, { data }) => {
                if (data.yandexMetricaEnabled && !value) {
                  return 'ID счетчика обязателен при включенной Yandex Metrica'
                }
                if (value && !/^\d+$/.test(value)) {
                  return 'ID должен содержать только цифры'
                }
                return true
              }
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'yandexMetricaClickmap',
                  type: 'checkbox',
                  label: 'Карта кликов',
                  defaultValue: true,
                  admin: {
                    width: '25%',
                    condition: (data) => data.yandexMetricaEnabled
                  }
                },
                {
                  name: 'yandexMetricaTrackLinks',
                  type: 'checkbox',
                  label: 'Отслеживание ссылок',
                  defaultValue: true,
                  admin: {
                    width: '25%',
                    condition: (data) => data.yandexMetricaEnabled
                  }
                },
                {
                  name: 'yandexMetricaWebvisor',
                  type: 'checkbox',
                  label: 'Вебвизор',
                  defaultValue: false,
                  admin: {
                    width: '25%',
                    condition: (data) => data.yandexMetricaEnabled,
                    description: 'Записывает действия пользователей'
                  }
                },
                {
                  name: 'yandexMetricaAccurateTrackBounce',
                  type: 'checkbox',
                  label: 'Точный отказ',
                  defaultValue: true,
                  admin: {
                    width: '25%',
                    condition: (data) => data.yandexMetricaEnabled
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'VK Pixel',
          fields: [
            {
              name: 'vkPixelEnabled',
              type: 'checkbox',
              label: 'Включить VK Pixel',
              defaultValue: false
            },
            {
              name: 'vkPixelIds',
              type: 'array',
              label: 'ID пикселей VK',
              admin: {
                condition: (data) => data.vkPixelEnabled,
                description: 'Можно добавить несколько пикселей'
              },
              fields: [
                {
                  name: 'pixelId',
                  type: 'text',
                  label: 'ID пикселя',
                  required: true,
                  admin: {
                    placeholder: 'VK-RTRG-000000-XXXXX'
                  },
                  validate: (value) => {
                    if (!/^VK-RTRG-\d+-[A-Z0-9]+$/.test(value)) {
                      return 'Неверный формат ID пикселя (должен быть VK-RTRG-XXXXXX-XXXXX)'
                    }
                    return true
                  }
                }
              ]
            },
            {
              name: 'vkPixelTrackPageView',
              type: 'checkbox',
              label: 'Отслеживать просмотры страниц',
              defaultValue: true,
              admin: {
                condition: (data) => data.vkPixelEnabled
              }
            }
          ]
        },
        {
          label: 'Top.Mail.Ru (VK Ads)',
          fields: [
            {
              name: 'topMailRuEnabled',
              type: 'checkbox',
              label: 'Включить Top.Mail.Ru',
              defaultValue: false,
              admin: {
                description: 'Система аналитики VK Ads (бывший Top.Mail.Ru)'
              }
            },
            {
              name: 'topMailRuId',
              type: 'text',
              label: 'ID счетчика Top.Mail.Ru',
              admin: {
                condition: (data) => data.topMailRuEnabled,
                placeholder: '3661858',
                description: 'Найдите в настройках счетчика на top.mail.ru'
              },
              validate: (value, { data }) => {
                if (data.topMailRuEnabled && !value) {
                  return 'ID счетчика обязателен при включенном Top.Mail.Ru'
                }
                if (value && !/^\d+$/.test(value)) {
                  return 'ID должен содержать только цифры'
                }
                return true
              }
            },
            {
              name: 'topMailRuTrackPageView',
              type: 'checkbox',
              label: 'Отслеживать просмотры страниц',
              defaultValue: true,
              admin: {
                condition: (data) => data.topMailRuEnabled
              }
            }
          ]
        },
        {
          label: 'Кастомные события',
          fields: [
            {
              name: 'customEvents',
              type: 'array',
              label: 'Настройки кастомных событий',
              admin: {
                description: 'Предустановленные события для отслеживания'
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Название события',
                  required: true,
                  admin: {
                    placeholder: 'button_click'
                  }
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Описание',
                  admin: {
                    placeholder: 'Клик по кнопке CTA'
                  }
                },
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Включено',
                  defaultValue: true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
