import { Block } from 'payload/types'

export const Audio: Block = {
  slug: 'audio',
  interfaceName: 'AudioBlock',
  fields: [
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Поддерживаемые форматы: MP3, WAV, OGG',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'artist',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'showWaveform',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать визуализацию аудио в виде волны',
      },
    },
    {
      name: 'autoPlay',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'downloadable',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Разрешить скачивание аудио файла',
      },
    },
  ],
  labels: {
    singular: 'Аудио блок',
    plural: 'Аудио блоки',
  },
}
