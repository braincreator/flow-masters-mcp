import { Field } from 'payload/types'

// Базовые поля, которые используются во всех блоках
export const blockFields: Field[] = [
  {
    name: 'blockName',
    type: 'text',
    required: false,
    admin: {
      description: 'Название блока (для админки)',
    },
  },
]
