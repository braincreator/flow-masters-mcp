import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { blocks } from '..'

export const Container: Block = {
  slug: 'container',
  labels: {
    singular: 'Контейнер',
    plural: 'Контейнеры',
  },
  graphQL: {
    singularName: 'ContainerBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'width',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'По умолчанию',
          value: 'default',
        },
        {
          label: 'Узкий',
          value: 'narrow',
        },
        {
          label: 'Широкий',
          value: 'wide',
        },
        {
          label: 'Полная ширина',
          value: 'full',
        },
      ],
      admin: {
        description: 'Максимальная ширина контейнера',
      },
    },
    {
      name: 'padding',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'По умолчанию',
          value: 'default',
        },
        {
          label: 'Нет отступов',
          value: 'none',
        },
        {
          label: 'Маленькие',
          value: 'small',
        },
        {
          label: 'Большие',
          value: 'large',
        },
      ],
      admin: {
        description: 'Внутренние отступы контейнера',
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: Object.values(blocks).filter((block) => block.slug !== 'container'),
      admin: {
        description: 'Добавьте блоки внутрь контейнера',
      },
    },
  ],
}
