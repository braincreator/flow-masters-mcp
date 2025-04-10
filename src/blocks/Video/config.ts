import { Block } from 'payload/types'
import { blockFields } from '../fields'

export const Video: Block = {
  slug: 'video',
  labels: {
    singular: 'Видео',
    plural: 'Видео',
  },
  graphQL: {
    singularName: 'VideoBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'videoType',
      type: 'select',
      required: true,
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'RuTube', value: 'rutube' },
        { label: 'VK', value: 'vk' },
        { label: 'MP4', value: 'mp4' },
      ],
      admin: {
        description: 'Выберите тип видео',
      },
    },
    {
      name: 'videoId',
      type: 'text',
      admin: {
        description: 'ID видео (для YouTube, Vimeo, RuTube, VK)',
        condition: (data) => ['youtube', 'vimeo', 'rutube', 'vk'].includes(data.videoType),
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'URL видео (опционально)',
        condition: (data) => ['youtube', 'vimeo', 'rutube', 'vk'].includes(data.videoType),
      },
    },
    {
      name: 'videoFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Загрузите MP4 файл',
        condition: (data) => data.videoType === 'mp4',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Превью изображение для видео',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16/9',
      options: [
        { label: '16:9', value: '16/9' },
        { label: '4:3', value: '4/3' },
        { label: '1:1', value: '1/1' },
        { label: '9:16', value: '9/16' },
      ],
      admin: {
        description: 'Соотношение сторон видео',
      },
    },
    {
      name: 'autoPlay',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Автоматическое воспроизведение',
      },
    },
    {
      name: 'muted',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Без звука по умолчанию',
      },
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Зациклить воспроизведение',
      },
    },
    {
      name: 'controls',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать элементы управления',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Подпись к видео',
      },
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Обычный', value: 'default' },
        { label: 'С тенью', value: 'shadow' },
        { label: 'С рамкой', value: 'bordered' },
      ],
      admin: {
        description: 'Стиль отображения',
      },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'Маленький', value: 'sm' },
        { label: 'Средний', value: 'md' },
        { label: 'Большой', value: 'lg' },
      ],
      admin: {
        description: 'Размер блока',
      },
    },
  ],
}

export default Video
