import type { Block } from 'payload'

export const FunnelStep: Block = {
  slug: 'funnelStep',
  interfaceName: 'FunnelStepBlock',
  labels: {
    singular: 'Шаг Воронки',
    plural: 'Шаги Воронки',
  },
  graphQL: false, // Этот блок чисто конфигурационный, не нужен в GraphQL API страницы
  fields: [
    {
      name: 'stepName',
      type: 'text',
      label: 'Название шага (для админки)',
      admin: {
        description: 'Внутреннее название для идентификации шага воронки в админ-панели.',
      },
      required: true,
    },
    {
      name: 'funnelId',
      type: 'text',
      label: 'Идентификатор воронки',
      admin: {
        description:
          'Уникальный идентификатор воронки (например, main_sales_funnel, onboarding_funnel). Используйте латиницу и нижнее подчеркивание.',
      },
      required: true,
    },
    {
      name: 'stepId',
      type: 'text',
      label: 'Идентификатор шага',
      admin: {
        description:
          'Уникальный идентификатор этого шага внутри воронки (например, visit_landing, download_lead_magnet, attend_webinar). Используйте латиницу и нижнее подчеркивание.',
      },
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Заметки (опционально)',
      admin: {
        description: 'Внутренние заметки для этого шага воронки.',
      },
    },
    // Примечание: Этот блок сам по себе не имеет визуального представления.
    // Его данные (funnelId, stepId) должны использоваться фронтенд-логикой:
    // 1. Для отправки событий в системы аналитики (например, через EventTracker).
    // 2. Для условного рендеринга контента (в связке с DynamicContent).
    // 3. Для отображения прогресс-бара воронки (требуется отдельный компонент).
  ],
}
